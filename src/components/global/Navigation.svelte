<script>
  import PrimaryBtn from "./PrimaryBtn.svelte";
  import Hamburger from './Hamburger.svelte';
  let navItems = [
    {
      name: "Home",
      link: "/"
    },
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Contact",
      link: "/contact",
    },
    {
      name: "Stories",
      link: "/stories",
    },
  ];

  let navToggled = false;
</script>

<nav class="bg-t-teal" data-testid="header-navigation">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center">
        <div class="flex-shrink-0">
            <img
              src="https://pub-14b6e6c1e28d49cbb9491101304b9098.r2.dev/almost_home_white.png"
              class="h-8 w-auto sm:h-10"
              alt="logo - heart with a house in the center"
            />
        </div>
        <div class="sm:ml-6 sm:block">
          <div class="flex space-x-4">
          {#each navItems as item}
            <a
              href={item.link}
              class="rounded-md px-3 py-2 text-sm font-bold text-white hover:text-white"
            >
              {item.name}
            </a>
          {/each} 
          </div>
        </div>
      </div>
      <div class="hidden sm:ml-6 sm:block">
        <div class="flex items-center">
          <button type="button" class="rounded-full p-1 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <PrimaryBtn class="uppercase" link="/donate/">Donate</PrimaryBtn>
          </button>
        </div>
      </div>
      <div class="-mr-2 flex sm:hidden">
        <Hamburger bind:open={navToggled}/>
      </div>
    </div>
  </div>

  <!-- Mobile menu, show/hide based on menu state. -->
  {#if navToggled}
  <div id="mobile-menu">
    <div class="space-y-1 px-2 pb-3 pt-2">
      {#each navItems as item}
          <a
            href={item.link}
            class="font-semibold text-white hover:text-sky-100 sm:text-sm md:text-lg tracking-wide"
          >
            {item.name}
          </a>
        {/each}
    </div>
  </div>
  {/if}
</nav>