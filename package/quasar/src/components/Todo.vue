<template>
    <div>
        TODOs
    </div>
    <div @click="() => store.addTodo({id: store.todos.length, title: `${new Date().toTimeString()} TODO`})">Add</div>
    <ul v-for="todo in store.todos">
        <li>{{todo.id}}: {{todo.title}}</li>
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