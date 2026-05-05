<script>
  export let title = "2026 Challenge for Charities";
  export let content = "";
  export let imageSrc = "https://via.placeholder.com/600x400?text=C4C+2026";
  export let imageAlt = "Challenge for Charities 2026";
</script>

<div class="bg-gray-50 py-24 sm:py-32" id="c4c">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-stretch">
      <div class="relative flex">
        <div class="absolute inset-px rounded-lg bg-white shadow-sm ring-1 ring-black/5 lg:rounded-l-4xl"></div>
        <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)] w-full">
          <div class="px-8 pt-8 pb-8 sm:px-10 sm:pt-10 sm:pb-10 flex flex-col h-full">
            <h2 class="text-3xl font-semibold tracking-tight text-gray-950 mb-6">{title}</h2>
            <div class="prose prose-lg text-gray-600 flex-grow">
              {@html content}
            </div>
          </div>
        </div>
      </div>
      <div class="relative flex">
        <div class="absolute inset-px rounded-lg bg-white shadow-sm ring-1 ring-black/5 lg:rounded-r-4xl"></div>
        <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-r-[calc(2rem+1px)] w-full">
          <img
            class="h-full w-full object-cover min-h-[400px]"
            src={imageSrc}
            alt={imageAlt}
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* You can add custom styles here if needed */
</style>
