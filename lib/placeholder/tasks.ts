export type PlaceholderTask = {
  id: string
  title: string
  priority: 1 | 2 | 3 | 4
  location: 'indoor' | 'outdoor'
  owner: 'Tim' | 'Wife' | 'Anyone'
  pinned: boolean
  has_shopping: boolean
}

export const placeholderTasks: PlaceholderTask[] = [
  {
    id: '1',
    title: 'Stain the back decking',
    priority: 1,
    location: 'outdoor',
    owner: 'Anyone',
    pinned: true,
    has_shopping: true,
  },
  {
    id: '2',
    title: 'Replace the kitchen tap washers',
    priority: 1,
    location: 'indoor',
    owner: 'Tim',
    pinned: false,
    has_shopping: false,
  },
  {
    id: '3',
    title: 'Order a replacement garden hose',
    priority: 2,
    location: 'outdoor',
    owner: 'Wife',
    pinned: false,
    has_shopping: true,
  },
  {
    id: '4',
    title: 'Sort the utility room shelving',
    priority: 2,
    location: 'indoor',
    owner: 'Anyone',
    pinned: false,
    has_shopping: false,
  },
  {
    id: '5',
    title: 'Repot the bay trees',
    priority: 3,
    location: 'outdoor',
    owner: 'Wife',
    pinned: false,
    has_shopping: false,
  },
  {
    id: '6',
    title: 'Touch up the hallway paint',
    priority: 3,
    location: 'indoor',
    owner: 'Tim',
    pinned: false,
    has_shopping: true,
  },
  {
    id: '7',
    title: 'Clean the log cabin roof',
    priority: 4,
    location: 'outdoor',
    owner: 'Anyone',
    pinned: false,
    has_shopping: false,
  },
  {
    id: '8',
    title: 'Organise the tool shed',
    priority: 4,
    location: 'outdoor',
    owner: 'Tim',
    pinned: true,
    has_shopping: false,
  },
]

export function tasksByPriority(priority: 1 | 2 | 3 | 4): PlaceholderTask[] {
  const group = placeholderTasks.filter((t) => t.priority === priority)
  return [...group.filter((t) => t.pinned), ...group.filter((t) => !t.pinned)]
}
