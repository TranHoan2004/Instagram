import { BasicInformation } from '~/components/setting/elements/BasicInformation'
import { PersonalInformation } from '~/components/setting/elements/PersonalInformation'
import { Button } from '@heroui/react'
import { SettingNavigation } from '~/components/setting/elements/SettingNavigation'

export const Setting = () => {
  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900 rounded-lg">
      <div className="w-full md:w-[300px] border-r border-gray-200 dark:border-gray-700">
        <SettingNavigation />
      </div>
      <div className="w-full md:w-4/5 h-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg h-full">
          <div className="p-0">
            <BasicInformation />
            <hr className="border-gray-300 dark:border-gray-700" />
            <PersonalInformation />

            <div className="p-4 flex justify-center items-center gap-3">
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
              >
                Submit
              </Button>
              <a
                href="#"
                className="text-blue-500 no-underline text-sm dark:text-blue-400"
              >
                Temporarily deactivate my account
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
