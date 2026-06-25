export type Note = {
  id: string;
  title: string;
  contentHtml: string;
  contentText: string;
  pinned: boolean;
  archived?: boolean;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
};
