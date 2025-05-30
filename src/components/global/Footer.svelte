<script>
const navigation = {
  main: [
    { name: "Stories", href: "/stories" },
    { name: "About", href: "/about" },
    { name: "Donate", href: "/donate" },
    { name: "Contact", href: "/contact" },
  ],
};
</script>

<footer class="bg-white">
  <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
    <nav
      class="-mx-5 -my-2 flex flex-wrap justify-center"
      aria-label="Footer"
    >
      {#each navigation.main as item}
        <div class="px-5 py-2">
          <a
            href={item.href}
            class="text-base text-gray-500 hover:text-gray-900"
          >
            {item.name}
          </a>
        </div>
      {/each}
    </nav>
    <p class="mt-8 text-center text-base text-gray-400">
      &copy; 2023 Almost Home Wyoming, Inc. All rights reserved. - built by <a href="https://ben.groneman.org" class="text-base text-gray-500 hover:text-gray-900">Ben Groneman</a>
    </p>
  </div>
</footer>
