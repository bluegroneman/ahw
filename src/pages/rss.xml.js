import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const stories = await getCollection('stories');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: stories.map((story) => ({
			...story.data,
			link: `/stories/${story.id}/`,
		})),
	});
}
