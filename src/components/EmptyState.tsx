import { Icon } from './Icon';

export function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-ios-2nd">
      <Icon
        name={searching ? 'search' : 'docText'}
        className="h-12 w-12"
        strokeWidth={1.4}
      />
      <p className="text-base font-medium">
        {searching ? 'Không tìm thấy ghi chú' : 'Chưa có ghi chú'}
      </p>
      {!searching && (
        <p className="text-sm">Chạm nút soạn để tạo ghi chú đầu tiên.</p>
      )}
    </div>
  );
}
