export interface SidebarItem {
  title: string;
  url: string;
  icon: 'dashboard' | 'folder' | 'package' | 'cart' | 'trophy' | 'users';
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}
