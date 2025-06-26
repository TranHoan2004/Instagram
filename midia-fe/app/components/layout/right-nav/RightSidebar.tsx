import SuggestedUsersList from '~/components/suggestion/SuggestedUsersList'

const RightSidebar = () => {
  return (
    <aside className="sticky right-0 top-[60px] h-[calc(100vh-60px)] w-80 md:translate-x-0 translate-x-full hidden lg:flex flex-col gap-4">
      <SuggestedUsersList />
    </aside>
  )
}

export default RightSidebar
