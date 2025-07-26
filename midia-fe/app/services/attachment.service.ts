import { restApiClient } from '~/lib/rest-client'

export const uploadFile = async (files: File | File[]) => {
  const fileArray = Array.isArray(files) ? files : [files]

  const uploadPromises = fileArray.map(async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await restApiClient.post(`/api/v1/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const attachmentId = response.data.attachmentId
    return {
      attachmentId,
      file
    }
  })

  return await Promise.all(uploadPromises)
}

export const getAttachmentUrls = async (
  ids: string[]
): Promise<Record<string, string>> => {
  const response = await restApiClient.post(`/api/v1/attachments/urls`, ids)
  return response.data
}
