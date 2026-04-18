export interface SidebarItem {
  title: string;
  url: string;
  icon: 'dashboard' | 'folder' | 'package' | 'cart' | 'trophy';
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}
