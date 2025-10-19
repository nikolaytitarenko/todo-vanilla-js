class ToDo {
  selectors = {
    root: '[data-js-todo]',
    theme: '[data-js-todo-theme]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    searchTaskForm: '[data-js-todo-search-task-form]',
    searchTaskInput: '[data-js-todo-search-task-input]',
    totalTasks: '[data-js-todo-total-tasks]',
    deleteAllButton: '[data-js-todo-delete-all-button]',
    list: '[data-js-todo-list]',
    item: '[data-js-todo-item]',
    itemCheckbox: '[data-js-todo-item-checkbox]',
    deleteItemButton: '[data-js-todo-item-delete-button]',
    emptyMessage: '[data-js-todo-empty-message]',
  }

  stateClasses = {
    isVisible: 'is_visible',
    isDisappearing: 'is_disappearing',
    isDarkTheme: 'is_dark-theme',
  }

  stateTheme = {
    light: 'light',
    dark: 'dark',
  }

  localStorageKey ={
    todoItem: 'todo-items',
    theme: 'theme',
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)
    this.themeSwitcherElement = document.querySelector(this.selectors.theme)
    this.newTaskFormElement = document.querySelector(this.selectors.newTaskForm)
    this.newTaskInputElement = document.querySelector(this.selectors.newTaskInput)
    this.searchTaskFormElement = document.querySelector(this.selectors.searchTaskForm)
    this.searchTaskInputElement = document.querySelector(this.selectors.searchTaskInput)
    this.totalTasksElement = document.querySelector(this.selectors.totalTasks)
    this.deleteAllButtonElement = document.querySelector(this.selectors.deleteAllButton)
    this.listElement = document.querySelector(this.selectors.list)
    this.itemElement = document.querySelector(this.selectors.item)
    this.itemCheckboxElement = document.querySelector(this.selectors.itemCheckbox)
    this.deleteButtonElement = document.querySelector(this.selectors.deleteAllButton)
    this.emptyMessageElement = document.querySelector(this.selectors.emptyMessage)
    this.state = {
      items: this.getItemsFromLocalStorage(),
      filteredItems: null,
      searchQuery: '',
    }
    this.initialTheme()
    this.render()
    this.bindEvents()
  }

  getItemsFromLocalStorage() {
    const rawData = localStorage.getItem(this.localStorageKey.todoItem)

    if (!rawData) {
      return []
    }

    try{
      const parsedData = JSON.parse(rawData);
      return Array.isArray(parsedData) ? parsedData : []
    }catch{
      console.error('Error in getItemsFromLocalStorage()')
      return []
    }
  }

  saveItemsFromLocalStorage() {
    localStorage.setItem(this.localStorageKey.todoItem, JSON.stringify(this.state.items))
  }

  get isDarkTheme() {
    const parsedDataTheme = JSON.parse(localStorage.getItem(this.localStorageKey.theme))
    return parsedDataTheme === this.stateTheme.dark
  }

  initialTheme(){
    this.isDarkTheme

    document.documentElement.classList.toggle(this.stateClasses.isDarkTheme, this.isDarkTheme)
  }

  onThemeSwitch = () => {
    document.documentElement.classList.toggle(this.stateClasses.isDarkTheme, !this.isDarkTheme)
    !this.isDarkTheme
      ? localStorage.setItem(this.localStorageKey.theme, JSON.stringify(this.stateTheme.dark))
      : localStorage.setItem(this.localStorageKey.theme, JSON.stringify(this.stateTheme.light))

  }


  render() {
    this.totalTasksElement.textContent = this.state.items.length

    this.deleteAllButtonElement.classList.toggle(this.stateClasses.isVisible, this.state.items.length > 0)

    const items = this.state.filteredItems ?? this.state.items

    this.listElement.innerHTML = items.map(({id, title, isChecked}) => `
      <li class="todo__item todo-item" data-js-todo-item>
      <input
          class="todo-item__checkbox"
          id="${id}"
          type="checkbox"
          ${isChecked ? "checked" : ""}
          data-js-todo-item-checkbox
      />
      <label class="todo-item__label" for="todo-1" data-js-todo-item-label>
        ${title}
      </label>
      <button
          class="todo-item__delete-button"
          type="button"
          aria-label="Delete task"
          title="Delete task"
          data-js-todo-item-delete-button
      >
      </button>
    </li>  
    `).join('')

    const isEmptyFilteredItems = this.state.filteredItems?.length === 0
    const isEmptyItems = this.state.items.length === 0

    this.emptyMessageElement.textContent = isEmptyFilteredItems
      ? 'Tasks no found': isEmptyItems ? 'There are no tasks yet' : ''
  }

  addItem(title){
    this.state.items.push({
      id: crypto?.randomUUID() ?? Date.now().toString(),
      title,
      isChecked: false,
    })
    this.saveItemsFromLocalStorage()
    this.render()
  }

  deleteItem (id){
    this.state.items = this.state.items.filter((element) => element.id !== id)
    this.saveItemsFromLocalStorage()
    this.render()
  }

  checkedToggle(id){
    this.state.items = this.state.items.map(item => {
      if (item.id === id) {
        return {...item, isChecked: !item.isChecked }
      }
      return item
    })
    this.saveItemsFromLocalStorage()
    this.render()
  }


  filter (title) {
    this.state.searchQuery = title

    const queryFormating = this.state.searchQuery.trim().toLowerCase()

    this.state.filteredItems = this.state.items.filter(element => element.title.toLowerCase().includes(queryFormating))
  }

  resetFilters() {
    this.state.searchQuery = ''
    this.state.filteredItems = null
  }

  onAddNewTask = (event) =>{
    event.preventDefault()

    const title = this.newTaskInputElement.value

    if(title.trim().length > 0){
      this.addItem(title);
      this.newTaskInputElement.value = ''
    }
  }

  onSearchTask = (event) => {
    event.preventDefault()
  }

  onSearchInputTask = () => {
    const titleQuery = this.searchTaskInputElement.value

    titleQuery.trim().length > 0
      ?this.filter(titleQuery)
      :this.resetFilters()
    this.saveItemsFromLocalStorage()
    this.render()
  }

  onClick = ({ target }) =>{
    if(target.matches(this.selectors.deleteItemButton)){
      const itemElement = target.closest(this.selectors.item)
      const taskElement = itemElement.querySelector(this.selectors.itemCheckbox)

      itemElement.classList.add(this.stateClasses.isDisappearing)

      setTimeout(()=>{
        this.deleteItem(taskElement.id)
      }, 500)
    }
  }

  onCheck = ({ target }) => {
    if(target.matches(this.selectors.itemCheckbox)){
      this.checkedToggle(target.id)
    }
  }

  onDeleteAllItems = () =>{
    this.state.items = []
    this.state.filteredItems = null
    this.saveItemsFromLocalStorage()
    this.render()
  }

  bindEvents() {
    this.newTaskFormElement.addEventListener('submit', this.onAddNewTask);
    this.searchTaskFormElement.addEventListener('submit', this.onSearchTask);
    this.searchTaskInputElement.addEventListener('input', this.onSearchInputTask);
    this.listElement.addEventListener('pointerdown', this.onClick);
    this.listElement.addEventListener('change', this.onCheck);
    this.deleteButtonElement.addEventListener('pointerdown', this.onDeleteAllItems)
    this.themeSwitcherElement.addEventListener('pointerdown',this.onThemeSwitch)
  }
}

new ToDo()
