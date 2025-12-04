import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdatePost } from '../hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { BloggerPost } from '../types'

const editPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하여야 합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  labels: z.string().optional(),
  publish: z.boolean().optional(),
})

type EditPostFormValues = z.infer<typeof editPostSchema>

interface EditPostFormProps {
  post: BloggerPost
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditPostForm({ post, onSuccess, onCancel }: EditPostFormProps) {
  const updatePost = useUpdatePost()

  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: post.title || '',
      content: post.content || '',
      labels: post.labels?.join(', ') || '',
      publish: post.status === 'LIVE',
    },
  })

  useEffect(() => {
    form.reset({
      title: post.title || '',
      content: post.content || '',
      labels: post.labels?.join(', ') || '',
      publish: post.status === 'LIVE',
    })
  }, [post, form])

  const onSubmit = async (values: EditPostFormValues) => {
    try {
      const labels = values.labels
        ? values.labels.split(',').map((label) => label.trim()).filter(Boolean)
        : undefined

      await updatePost.mutateAsync({
        postId: post.id,
        blogId: post.blog.id,
        title: values.title,
        content: values.content,
        labels,
        publish: values.publish,
      })

      toast.success('포스트가 성공적으로 수정되었습니다.')
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포스트 수정에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">포스트 수정</h2>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 *</FormLabel>
              <FormControl>
                <Input placeholder="포스트 제목을 입력하세요" {...field} />
              </FormControl>
              <FormDescription>포스트의 제목을 입력하세요 (최대 200자)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="포스트 내용을 입력하세요 (HTML 지원)"
                  className="min-h-[300px] font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                포스트 내용을 입력하세요. HTML 태그를 사용할 수 있습니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="labels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>태그</FormLabel>
              <FormControl>
                <Input
                  placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                  {...field}
                />
              </FormControl>
              <FormDescription>태그를 쉼표로 구분하여 입력하세요</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publish"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>발행 상태</FormLabel>
                <FormDescription>
                  체크하면 포스트를 발행합니다. 체크하지 않으면 초안으로 저장됩니다.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" disabled={updatePost.isPending}>
            {updatePost.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수정 중...
              </>
            ) : (
              '포스트 수정'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

