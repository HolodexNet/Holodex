import { defineStore } from "pinia";

interface Todo {
  id: number;
  title: string;
}

interface State {
  todos: Todo[];
}

export const useTodoStore = defineStore("todo", {
  // convert to a function
  state: (): State => ({
    todos: [
      {
        id: 1,
        title: "Learn Pinia",
      },
    ],
  }),
  getters: {
    firstTodoTitle: (state) => `${state.todos[0].title}`,
  },
  actions: {
    // no context as first argument, use `this` instead
    // async loadUser(id: number) {
    //   if (this.userId !== null) throw new Error("Already logged in");
    //   const res = await api.user.load(id);
    //   this.updateUser(res);
    // },
    // mutations can now become actions, instead of `state` as first argument use `this`
    addTodo(payload) {
      this.firstName = payload.firstName;
    },
  },
});
