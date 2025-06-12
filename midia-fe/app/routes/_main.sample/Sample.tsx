import { Card } from '@heroui/react'
import Comment from '../../components/post/Comment'
import NavigationItem from '../../components/ui/NavigationItem'
import PostImageCarousel from '../../components/post/PostImageCarousel'
import SearchBar from '../../components/ui/SearchBar'
import SuggestedUsersList from '../../components/suggestion/SuggestedUsersList'
import SuggestionCardHorizontal from '../../components/suggestion/SuggestionCardHorizontal'
import SuggestionsHeader from '../../components/suggestion/SuggestionsHeader'
import SuggestionsCarousel from '../../components/suggestion/SuggestionsCarousel'

const Sample = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card className=" p-4">
        <b>Comment</b>
        <Comment
          username={'KzDiary'}
          content={
            'HeroUI is a React UI library that provides a set of accessible, reusable, and beautiful components.'
          }
        />
      </Card>

      <Card className="p-4">
        <b>Navigation Item</b>
        <NavigationItem
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          }
          label={'Example Navigation'}
          path={'/'}
          activeIcon={null}
        />
      </Card>

      <Card className="p-4">
        <b>Post Image Carousel:</b>
        <PostImageCarousel
          image={[
            'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
            'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=',
            'https://media.istockphoto.com/id/1482826042/photo/railroad.jpg?s=612x612&w=0&k=20&c=g0WFmccSZ7f38TRgXuixjB1fDKcofcb6nW-9sEL6J0M='
          ]}
          alt={'Example Post Image Carousel'}
        />
      </Card>

      <Card className="p-4">
        <b>Search</b>
        <SearchBar />
      </Card>

      <Card className="p-4">
        <b>Suggested Users List</b>
        <SuggestedUsersList />
      </Card>

      <Card className="p-4">
        <b>Suggestion Card Horizontal</b>
        <SuggestionCardHorizontal
          avatar={
            'https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-4-1.jpg'
          }
          username={'KzDiary'}
          subtitle={'Tuấn Khanh Nguyễn'}
          onFollow={() => {}}
          onDismiss={() => {}}
        />
      </Card>

      <Card className="p-4">
        <b>Suggestion Card Horizontal</b>
        <SuggestionsHeader title="Suggested for you" onSeeAllClick={() => {}} />
      </Card>

      <Card className="p-4">
        <b>Suggestion Carousel </b>
        <SuggestionsCarousel />
      </Card>
    </div>
  )
}

export default Sample
