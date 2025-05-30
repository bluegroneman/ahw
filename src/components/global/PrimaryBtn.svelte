<script>
    export let link;
</script>
<a
    class={
      "flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-t-orange shadow-sm hover:bg-indigo-50 sm:px-8"
    }
    href={link}
>
    <slot></slot>
</a>