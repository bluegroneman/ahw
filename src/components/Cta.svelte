<script>
    import SecondaryBtn from './global/SecondaryBtn.svelte';
    export let image_url = "images/pexels-photo-1.jpg";
    export let header = "Header"
    export let body = "body"
    export let link = "/"
</script>
<div>
    <dt>
      <div class="flex items-center justify-center h-12 w-12 rounded-md bg-t-blue text-white">
<!--        <img src={image_url} alt={"Associated CTA Image"} />-->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>

      </div>
      <p class="mt-5 text-lg leading-6 font-medium text-gray-900">
        {header}
      </p>
    </dt>
    <dd class="mt-2 text-base text-gray-500">
      <p class="text-sm leading-5 text-gray-900">{body}</p>
    </dd>
    <SecondaryBtn link={link}>Learn More</SecondaryBtn>
  </div>