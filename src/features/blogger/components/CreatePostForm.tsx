import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePost } from '../hooks'
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
import type { BloggerBlog } from '../types'

const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하여야 합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  labels: z.string().optional(),
  publish: z.boolean(),
})

type CreatePostFormValues = z.infer<typeof createPostSchema>

interface CreatePostFormProps {
  blog: BloggerBlog
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreatePostForm({ blog, onSuccess, onCancel }: CreatePostFormProps) {
  const createPost = useCreatePost()

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      labels: '',
      publish: false,
    },
  })

  const onSubmit = async (values: CreatePostFormValues) => {
    try {
      const labels = values.labels
        ? values.labels.split(',').map((label) => label.trim()).filter(Boolean)
        : undefined

      await createPost.mutateAsync({
        blogId: blog.id,
        title: values.title,
        content: values.content,
        labels,
        publish: values.publish,
      })

      toast.success('포스트가 성공적으로 생성되었습니다.')
      form.reset()
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포스트 생성에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">새 포스트 작성</h2>
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

        <div className="text-sm text-muted-foreground">
          블로그: <span className="font-medium">{blog.name}</span>
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
                <FormLabel>즉시 발행</FormLabel>
                <FormDescription>
                  체크하면 포스트를 즉시 발행합니다. 체크하지 않으면 초안으로 저장됩니다.
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
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              '포스트 생성'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

