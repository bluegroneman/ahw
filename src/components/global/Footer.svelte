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
<footer>
  <div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
    <nav class="pb-4 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6" aria-label="Footer">
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
    <p class="text-gray-600 hover:text-gray-800">
      &copy; 2025 Almost Home Wyoming, Inc. All rights reserved. - built by <a href="https://blue.groneman.org" class="text-base text-gray-500 hover:text-gray-900">Blue</a>
    </p>
  </div>
</footer>