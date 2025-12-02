import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold">
          Autobot
        </Link>
        <nav className="flex gap-4">
          <Link to="/dashboard">
            <Button variant="ghost">대시보드</Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost">설정</Button>
          </Link>
          {/* TODO: 로그아웃 버튼 추가 */}
        </nav>
      </div>
    </header>
  )
}

