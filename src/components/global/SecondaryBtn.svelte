<script>
    export let link;
</script>
<a
    class={
      "group cursor-pointer rounded my-2 inline-flex items-center justify-center py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-t-blue text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900"
    }
    href={link}
>
    <slot></slot>
</a>
