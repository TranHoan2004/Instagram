import SuggestedUsersList from './SuggestedUsersList'

const SuggestionsPanel = () => {
  const handleSeeAll = () => {
    console.log('Navigate to suggestions page')
  }

  const handleSwitch = () => {
    console.log('Switch account')
  }

  const handleUserAction = (userId: string, action: 'follow' | 'unfollow') => {
    console.log(`${action} user ${userId}`)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <SuggestedUsersList
        onSeeAll={handleSeeAll}
        onSwitch={handleSwitch}
        onUserAction={handleUserAction}
      />
    </div>
  )
}

export default SuggestionsPanel
