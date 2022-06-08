<template>
    <div>
        TODOs
    </div>
    <div @click="() => store.addTodo({id: ((store.todos[store.todos.length - 1]?.id || 0) + 1), title: `${new Date().toTimeString()} TODO`})">Add</div>
    <ul v-for="todo in store.todos">
        <li>{{todo.id}}: {{todo.title}} (<span @click="() => store.deleteTodo(todo.id)">click to delete</span>)</li>
    </ul>
</template>

<script lang="ts">
import { useTodoStore } from "@/stores/todo";

export default defineComponent({
    setup() {
        const todos = useTodoStore();

        return {store: todos,}
    },
})
</script>