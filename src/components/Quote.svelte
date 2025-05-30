<script>
    export let quote = ""
    export let author = ""
</script>
<div class="max-w-fit my-4 p-4 text-gray-800 rounded-lg shadow from-t-teal to-t-blue bg-gradient-to-l">
    <div class="mb-2 justify-center">
        <div class="h-3 text-3xl text-left text-white">“</div>
        <p class="px-4 text-lg text-left text-white">
            {quote}
        </p>
        <p class="font-bold mt-4 text-t-orange">- {author}</p>
        <div class="h-3 text-3xl text-right text-t-white">”</div>
    </div>
</div>
