<script>
    export let quote = ""
    export let author = ""
</script>
<div class="max-w-fit my-6 p-4 text-gray-800 rounded-lg shadow">
    <figure class="border-l border-indigo-600 pl-8 dark:border-indigo-400">
      <blockquote class="text-xl/8 font-semibold tracking-tight text-gray-900">
        <p>"{quote}"</p>
      </blockquote>
      <figcaption class="mt-8 flex gap-x-2">
        <div class="text-sm/6">
          <div class="font-semibold text-gray-900">{author}</div>
        </div>
      </figcaption>
    </figure>
</div>
