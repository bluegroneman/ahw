<script>
    export let headline = "insert headline";
    export let body = "insert body";
    export let imageSrc = "";
</script>
<div class="relative px-6 lg:px-8 mb-12">
  <div class="absolute inset-0 from-purple-600 to-blue-600 bg-blend-screen">
    {#if imageSrc !== ""}
      <img
        class="h-full w-full object-cover filter"
        src={imageSrc}
        alt="Almost Home Wyoming"
      />
    {:else}
    <div class="h-full w-full object-cover filter bg-gradient-to-r from-t-teal to-t-blue">
    </div>
    {/if}
  </div>

  <div class="relative mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">{headline}</h1>
      <h2 class="mt-6 text-2xl leading-8 text-t-orange">{body}</h2>
    </div>
  </div>
</div>
<style>
  .filter {
    filter: brightness(75%);
  }
</style>
