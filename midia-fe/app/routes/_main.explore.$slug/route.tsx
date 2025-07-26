import type { MetaFunction } from 'react-router'
import type { Route } from '../_main.explore.$slug/+types/route'
import { requireAuth } from '~/.server/auth'
import ExplorePeople from './people/ExplorePeople'
import ExplorePosts from './posts/ExplorePosts'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia | Explore' }]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await requireAuth(request)

  return {
    slug: params.slug
  }
}

const ExploreSlug = ({ loaderData }: Route.ComponentProps) => {
  if (loaderData.slug === 'people') {
    return <ExplorePeople />
  }

  if (loaderData.slug === 'posts') {
    return <ExplorePosts />
  }
}

export default ExploreSlug
