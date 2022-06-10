<template>
    <div>
        TODOs
    </div>
    <div
        @click="() => store.addTodo({ id: ((store.todos[store.todos.length - 1]?.id || 0) + 1), title: `${new Date().toTimeString()} TODO` })">
        Add</div>
    <ul v-for="todo in store.todos">
        <li>{{ todo.id }}: {{ todo.title }} (<span @click="() => store.deleteTodo(todo.id)">click to delete</span>)</li>
    </ul>
    <div>
        LA Current Time: {{ out }}
    </div>
</template>

<script lang="ts">
import { useTodoStore } from "@/stores/todo";
import { useQuery } from "vue-query";

export default defineComponent({
    setup() {
        const todos = useTodoStore();

        // testing vue-query cross tab pollination looks GOOD
        const { isLoading, isError, data, error } = useQuery(['LA_Timezone'], async (e) => {

            const resp = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");

            // const resp = await fetch('http://worldtimeapi.org/api/timezone/America/Los_Angeles')
            return (resp.body as any);
        }, { staleTime: 20000, cacheTime: 30000 })

        return { store: todos, isLoading, isError, out: data }
    },
})
</script>