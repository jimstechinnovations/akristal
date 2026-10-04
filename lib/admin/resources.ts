// Every admin-editable part of the website, described once. The generic admin list,
// form and save action all read from here, so adding a field is a one-line change.
// Shared by server and client: no server-only imports.

export type Option = { value: string; label: string }

export type SubField = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'image'
  placeholder?: string
}

export type Field = {
  name: string
  label: string
  help?: string
  required?: boolean
  placeholder?: string
  readOnly?: boolean
  /** Shown on wide screens beside another half-width field */
  half?: boolean
} & (
  | { type: 'text' | 'textarea' | 'url' | 'email' | 'date' | 'richtext' }
  | { type: 'number'; step?: number; min?: number; max?: number }
  | { type: 'boolean' }
  | { type: 'select'; options?: Option[]; optionsFrom?: 'agents' | 'currencies' }
  | { type: 'tags' }
  | { type: 'numberTags' }
  | { type: 'image' }
  | { type: 'images'; accept?: string }
  | { type: 'keyValue'; valueType: 'number' | 'text'; keyLabel: string; valueLabel: string }
  | { type: 'list'; itemLabel: string; fields: SubField[] }
)

export type Resource = {
  key: string
  /** Sidebar group */
  group: 'Website content' | 'Inbox' | 'Settings'
  title: string
  singular: string
  description: string
  table: string
  /** Settings resources store one JSON document in site_settings.value under this key */
  settingKey?: string
  idColumn?: string
  /** Rows the resource covers, e.g. only agent profiles */
  filter?: Record<string, string>
  listColumns: { name: string; label: string; format?: 'date' | 'boolean' | 'money' | 'image' | 'status' | 'stars' }[]
  searchColumns: string[]
  orderBy: { column: string; ascending: boolean }
  canCreate: boolean
  canDelete: boolean
  fields: Field[]
  /** Public pages refreshed after a save so changes show immediately */
  revalidate: string[]
  /** Where the record appears on the public site */
  viewHref?: (row: Record<string, unknown>) => string | null
}

export const CURRENCIES: Option[] = ['RWF', 'NGN', 'USD', 'ZAR', 'AED', 'UGX'].map((c) => ({ value: c, label: c }))
const opts = (...values: [string, string][]) => values.map(([value, label]) => ({ value, label }))

export const resources: Resource[] = [
  {
    key: 'developments',
    group: 'Website content',
    title: 'Developments',
    singular: 'development',
    description: "Akristal's own projects. These appear first on the home page and on Our developments.",
    table: 'projects',
    listColumns: [
      { name: 'cover_image_url', label: '', format: 'image' },
      { name: 'name', label: 'Name' },
      { name: 'stage', label: 'Stage', format: 'status' },
      { name: 'status', label: 'Status', format: 'status' },
      { name: 'is_featured', label: 'On home page', format: 'boolean' },
      { name: 'display_order', label: 'Order' },
    ],
    searchColumns: ['name', 'title', 'city'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, help: 'Short name shown on cards, e.g. "Pearl View Residence".' },
      { name: 'slug', label: 'Web address', type: 'text', help: 'Lower-case words with dashes, e.g. pearl-view-residence. Leave empty to use the ID.' , half: true },
      { name: 'title', label: 'Headline', type: 'text', required: true, help: 'Longer announcement title.' },
      { name: 'summary', label: 'Summary', type: 'textarea', help: 'One or two sentences shown on cards and at the top of the page.' },
      { name: 'description', label: 'Full description', type: 'textarea' },
      { name: 'status', label: 'Visibility', type: 'select', required: true, half: true, options: opts(['draft', 'Draft (hidden)'], ['active', 'Active'], ['completed', 'Completed'], ['sold_out', 'Sold out'], ['archived', 'Archived (hidden)']) },
      { name: 'stage', label: 'Stage', type: 'select', half: true, options: opts(['off_plan', 'Off-plan'], ['under_construction', 'Under construction'], ['completed', 'Completed']) },
      { name: 'progress_pct', label: 'Construction progress (%)', type: 'number', min: 0, max: 100, half: true, help: 'Shown while under construction.' },
      { name: 'completion_date', label: 'Completion date', type: 'date', half: true },
      { name: 'type', label: 'Type', type: 'select', half: true, options: opts(['bungalow', 'Bungalow'], ['duplex', 'Duplex'], ['terraces', 'Terraces'], ['town_house', 'Town house'], ['apartment', 'Apartment'], ['high_rising', 'High-rise'], ['condominiums', 'Condominiums'], ['commercial_spaces', 'Commercial spaces']) },
      { name: 'district', label: 'Area or district', type: 'text', half: true, placeholder: 'e.g. Karenge Sector, Rwamagana District' },
      { name: 'city', label: 'City', type: 'text', half: true },
      { name: 'country', label: 'Country', type: 'text', half: true },
      { name: 'pre_selling_price', label: 'Pre-selling price (from)', type: 'number', half: true },
      { name: 'pre_selling_currency', label: 'Currency', type: 'select', half: true, optionsFrom: 'currencies' },
      { name: 'main_price', label: 'Main price (from)', type: 'number', half: true },
      { name: 'main_currency', label: 'Currency', type: 'select', half: true, optionsFrom: 'currencies' },
      {
        name: 'unit_types',
        label: 'Homes in this development',
        type: 'list',
        itemLabel: 'home type',
        fields: [
          { name: 'type', label: 'Type', type: 'text', placeholder: 'e.g. 4-bedroom duplex' },
          { name: 'units', label: 'Number of units', type: 'number' },
          { name: 'bedsMin', label: 'Beds from', type: 'number' },
          { name: 'bedsMax', label: 'Beds to', type: 'number' },
        ],
      },
      { name: 'cover_image_url', label: 'Cover image', type: 'image', help: 'Used on cards. The page hero uses the second photo when there is one.' },
      { name: 'media_urls', label: 'Photos, plans and videos', type: 'images', accept: 'image/*,video/*' },
      { name: 'pay_small_small', label: 'Pay Small Small available', type: 'boolean' },
      { name: 'is_featured', label: 'Show on the home page', type: 'boolean' },
      { name: 'display_order', label: 'Order', type: 'number', help: 'Lower numbers appear first.', half: true },
    ],
    revalidate: ['/', '/projects', '/about'],
    viewHref: (r) => `/projects/${(r.slug as string) || (r.id as string)}`,
  },
  {
    key: 'listings',
    group: 'Website content',
    title: 'Listing settings',
    singular: 'listing',
    description: 'Feature a home on the home page, assign its agent, approve it, and pin it on the map. Edit photos and details in Properties.',
    table: 'properties',
    listColumns: [
      { name: 'cover_image_url', label: '', format: 'image' },
      { name: 'title', label: 'Home' },
      { name: 'city', label: 'Area' },
      { name: 'listing_status', label: 'Approval', format: 'status' },
      { name: 'status', label: 'Availability', format: 'status' },
      { name: 'is_featured', label: 'Featured', format: 'boolean' },
    ],
    searchColumns: ['title', 'city', 'address'],
    orderBy: { column: 'created_at', ascending: false },
    canCreate: false,
    canDelete: false,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'listing_status', label: 'Approval', type: 'select', half: true, options: opts(['draft', 'Draft'], ['pending_approval', 'Waiting for approval'], ['approved', 'Approved (live)'], ['rejected', 'Rejected'], ['suspended', 'Suspended']) },
      { name: 'status', label: 'Availability', type: 'select', half: true, options: opts(['available', 'Available'], ['pending', 'Under offer'], ['sold', 'Sold'], ['rented', 'Rented'], ['suspended', 'Suspended']) },
      { name: 'agent_id', label: 'Agent', type: 'select', optionsFrom: 'agents', help: 'The agent shown on the listing and on whose profile it appears.' },
      { name: 'is_featured', label: 'Feature on the home page', type: 'boolean' },
      { name: 'latitude', label: 'Latitude', type: 'number', step: 0.000001, half: true, help: 'From Google Maps: right-click the spot and copy the numbers.' },
      { name: 'longitude', label: 'Longitude', type: 'number', step: 0.000001, half: true },
    ],
    revalidate: ['/', '/properties', '/agents'],
    viewHref: (r) => `/properties/${r.id as string}`,
  },
  {
    key: 'agents',
    group: 'Website content',
    title: 'Agent profiles',
    singular: 'agent profile',
    description: 'What visitors see on Find an agent and each agent page. Create the account first in Users with the role Agent.',
    table: 'profiles',
    filter: { role: 'agent' },
    listColumns: [
      { name: 'avatar_url', label: '', format: 'image' },
      { name: 'full_name', label: 'Name' },
      { name: 'title', label: 'Title' },
      { name: 'is_featured', label: 'Featured', format: 'boolean' },
      { name: 'is_active', label: 'Visible', format: 'boolean' },
    ],
    searchColumns: ['full_name', 'email'],
    orderBy: { column: 'full_name', ascending: true },
    canCreate: false,
    canDelete: false,
    fields: [
      { name: 'full_name', label: 'Full name', type: 'text', required: true, half: true },
      { name: 'title', label: 'Job title', type: 'text', half: true, placeholder: 'e.g. Senior sales agent' },
      { name: 'slug', label: 'Web address', type: 'text', help: 'e.g. kharim-banyundo. Leave empty to generate one.' },
      { name: 'avatar_url', label: 'Photo', type: 'image', help: 'Portrait, shoulders up, plain background.' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      { name: 'phone', label: 'Phone', type: 'text', half: true, placeholder: '+250 788 000 000' },
      { name: 'whatsapp', label: 'WhatsApp number', type: 'text', half: true, help: 'Digits with country code.' },
      { name: 'email', label: 'Email', type: 'email', readOnly: true, help: 'Change it from the user account.' },
      { name: 'areas_served', label: 'Areas served', type: 'tags', help: 'Press Enter after each, e.g. Kibagabaga.' },
      { name: 'specialties', label: 'Specialities', type: 'tags', help: 'e.g. Sales, Rentals, Luxury homes, Off-plan.' },
      { name: 'languages', label: 'Languages', type: 'tags' },
      { name: 'socials', label: 'Social links', type: 'keyValue', valueType: 'text', keyLabel: 'Network', valueLabel: 'Link' },
      { name: 'years_experience', label: 'Years of experience', type: 'number', half: true },
      { name: 'license_number', label: 'Licence or registration', type: 'text', half: true },
      { name: 'is_verified', label: 'Verified', type: 'boolean' },
      { name: 'is_featured', label: 'Featured (listed first)', type: 'boolean' },
      { name: 'is_active', label: 'Visible on the website', type: 'boolean' },
    ],
    revalidate: ['/', '/agents'],
    viewHref: () => '/agents',
  },
  {
    key: 'team',
    group: 'Website content',
    title: 'Team',
    singular: 'team member',
    description: 'The people shown on the home page and About.',
    table: 'members',
    listColumns: [
      { name: 'image_url', label: '', format: 'image' },
      { name: 'name', label: 'Name' },
      { name: 'role', label: 'Role' },
      { name: 'is_active', label: 'Visible', format: 'boolean' },
      { name: 'display_order', label: 'Order' },
    ],
    searchColumns: ['name', 'role'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, help: 'Credentials can follow in brackets, e.g. Jane Doe (FCA).' },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'image_url', label: 'Photo', type: 'image' },
      { name: 'details', label: 'Short bio', type: 'textarea', required: true },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
      { name: 'is_active', label: 'Visible on the website', type: 'boolean' },
    ],
    revalidate: ['/', '/about'],
  },
  {
    key: 'furniture',
    group: 'Website content',
    title: 'Furniture',
    singular: 'furniture item',
    description: 'The catalogue on the Furniture page. Leave the price empty and tick "Price on request" to hide it.',
    table: 'furniture_items',
    listColumns: [
      { name: 'image_urls', label: '', format: 'image' },
      { name: 'name', label: 'Item' },
      { name: 'category', label: 'Category', format: 'status' },
      { name: 'price', label: 'Price', format: 'money' },
      { name: 'is_published', label: 'Published', format: 'boolean' },
    ],
    searchColumns: ['name', 'sku'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'sku', label: 'Reference (SKU)', type: 'text', half: true },
      { name: 'category', label: 'Category', type: 'select', required: true, half: true, options: opts(['living', 'Living room'], ['dining', 'Dining'], ['bedroom', 'Bedroom'], ['office', 'Office'], ['outdoor', 'Outdoor'], ['lighting', 'Lighting'], ['decor', 'Decor']) },
      { name: 'image_urls', label: 'Photos', type: 'images', accept: 'image/*', help: 'The first photo is the cover.' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'price', label: 'Price', type: 'number', half: true },
      { name: 'currency', label: 'Currency', type: 'select', half: true, optionsFrom: 'currencies' },
      { name: 'price_on_request', label: 'Price on request', type: 'boolean' },
      { name: 'dimensions', label: 'Size', type: 'text', placeholder: 'W 210 × D 90 × H 80 cm' },
      { name: 'materials', label: 'Materials', type: 'tags' },
      { name: 'colours', label: 'Colours', type: 'tags' },
      { name: 'lead_time_days', label: 'Lead time (days)', type: 'number', half: true },
      { name: 'made_to_order', label: 'Made to order', type: 'boolean' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
    ],
    revalidate: ['/furniture'],
    viewHref: () => '/furniture',
  },
  {
    key: 'interiors',
    group: 'Website content',
    title: 'Interior portfolio',
    singular: 'portfolio project',
    description: 'Projects on the Interior design page. Add before/after pairs to show the comparison slider.',
    table: 'interior_projects',
    listColumns: [
      { name: 'cover_image_url', label: '', format: 'image' },
      { name: 'title', label: 'Project' },
      { name: 'location', label: 'Location' },
      { name: 'space_type', label: 'Type', format: 'status' },
      { name: 'is_published', label: 'Published', format: 'boolean' },
    ],
    searchColumns: ['title', 'location'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Web address', type: 'text', required: true, help: 'Lower-case words with dashes, unique.' },
      { name: 'location', label: 'Location', type: 'text', half: true },
      { name: 'space_type', label: 'Type of space', type: 'select', half: true, options: opts(['residential', 'Home'], ['hospitality', 'Short-let or hospitality'], ['commercial', 'Office or shop']) },
      { name: 'services', label: 'Services', type: 'tags', help: 'e.g. Interior design, Furniture, Lighting.' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'cover_image_url', label: 'Cover image', type: 'image' },
      { name: 'image_urls', label: 'Gallery', type: 'images', accept: 'image/*' },
      {
        name: 'before_after',
        label: 'Before and after',
        type: 'list',
        itemLabel: 'pair',
        fields: [
          { name: 'before', label: 'Before photo', type: 'image' },
          { name: 'after', label: 'After photo', type: 'image' },
          { name: 'caption', label: 'Caption', type: 'text' },
        ],
      },
      { name: 'completed_on', label: 'Completed', type: 'date', half: true },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
      { name: 'is_published', label: 'Published', type: 'boolean' },
    ],
    revalidate: ['/interior-design'],
    viewHref: () => '/interior-design',
  },
  {
    key: 'plans',
    group: 'Website content',
    title: 'Pay Small Small plans',
    singular: 'plan',
    description: 'Deposit, tenures and any premium used by every Pay Small Small calculator. The first active plan is used.',
    table: 'installment_plans',
    listColumns: [
      { name: 'name', label: 'Plan' },
      { name: 'min_deposit_pct', label: 'Min deposit %' },
      { name: 'is_active', label: 'Active', format: 'boolean' },
    ],
    searchColumns: ['name'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'min_deposit_pct', label: 'Minimum deposit (%)', type: 'number', required: true, min: 0, max: 100, half: true },
      { name: 'tenures_months', label: 'Tenures (months)', type: 'numberTags', required: true, help: 'e.g. 6, 12, 18, 24.' },
      { name: 'premium_pct_by_tenure', label: 'Premium by tenure', type: 'keyValue', valueType: 'number', keyLabel: 'Months', valueLabel: 'Premium %', help: 'Extra % on the balance for each tenure. 0 means no extra cost.' },
      { name: 'eligibility', label: 'Who can apply', type: 'tags' },
      { name: 'terms_url', label: 'Link to full terms', type: 'url' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
    ],
    revalidate: ['/', '/pay-small-small', '/properties', '/projects'],
    viewHref: () => '/pay-small-small',
  },
  {
    key: 'lenders',
    group: 'Website content',
    title: 'Lenders',
    singular: 'lender',
    description: 'Partner banks listed on the Mortgage page. Publish only lenders you have an agreement with.',
    table: 'lenders',
    listColumns: [
      { name: 'logo_url', label: '', format: 'image' },
      { name: 'name', label: 'Lender' },
      { name: 'rate_from_pct', label: 'Rate from %' },
      { name: 'is_published', label: 'Published', format: 'boolean' },
    ],
    searchColumns: ['name'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'logo_url', label: 'Logo', type: 'image' },
      { name: 'countries', label: 'Countries', type: 'tags' },
      { name: 'rate_from_pct', label: 'Rates from (%)', type: 'number', step: 0.01, half: true },
      { name: 'max_term_years', label: 'Longest term (years)', type: 'number', half: true },
      { name: 'max_ltv_pct', label: 'Maximum loan-to-value (%)', type: 'number', half: true },
      { name: 'website_url', label: 'Website', type: 'url' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
      { name: 'is_published', label: 'Published', type: 'boolean' },
    ],
    revalidate: ['/mortgage'],
    viewHref: () => '/mortgage',
  },
  {
    key: 'testimonials',
    group: 'Website content',
    title: 'Testimonials',
    singular: 'testimonial',
    description: 'Quotes from real clients, shown on the home page. Publish only with the client’s permission.',
    table: 'testimonials',
    listColumns: [
      { name: 'name', label: 'Client' },
      { name: 'context', label: 'Context' },
      { name: 'consent_given', label: 'Consent', format: 'boolean' },
      { name: 'is_published', label: 'Published', format: 'boolean' },
    ],
    searchColumns: ['name', 'quote'],
    orderBy: { column: 'display_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Client name', type: 'text', required: true, half: true },
      { name: 'context', label: 'Context', type: 'text', half: true, placeholder: 'e.g. Bought in Kibagabaga, 2026' },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true, help: 'Up to 600 characters.' },
      { name: 'consent_given', label: 'The client agreed to be quoted', type: 'boolean', help: 'Required before publishing.' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'display_order', label: 'Order', type: 'number', half: true },
    ],
    revalidate: ['/'],
  },
  {
    key: 'leads',
    group: 'Inbox',
    title: 'Leads',
    singular: 'lead',
    description: 'Every request sent from the website: viewings, valuations, consultations, Pay Small Small, mortgage and contact forms.',
    table: 'leads',
    listColumns: [
      { name: 'created_at', label: 'Received', format: 'date' },
      { name: 'type', label: 'Type', format: 'status' },
      { name: 'name', label: 'Name' },
      { name: 'phone', label: 'Phone' },
      { name: 'status', label: 'Status', format: 'status' },
    ],
    searchColumns: ['name', 'email', 'phone', 'message'],
    orderBy: { column: 'created_at', ascending: false },
    canCreate: false,
    canDelete: true,
    fields: [
      { name: 'type', label: 'Type', type: 'text', readOnly: true, half: true },
      { name: 'created_at', label: 'Received', type: 'text', readOnly: true, half: true },
      { name: 'name', label: 'Name', type: 'text', readOnly: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true, half: true },
      { name: 'email', label: 'Email', type: 'text', readOnly: true, half: true },
      { name: 'message', label: 'Message', type: 'textarea', readOnly: true },
      { name: 'payload', label: 'Form details', type: 'keyValue', valueType: 'text', keyLabel: 'Field', valueLabel: 'Answer', readOnly: true },
      { name: 'source_path', label: 'Sent from page', type: 'text', readOnly: true },
      { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: opts(['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['closed', 'Closed'], ['spam', 'Spam']) },
      { name: 'assigned_to', label: 'Assigned agent', type: 'select', half: true, optionsFrom: 'agents' },
      { name: 'admin_notes', label: 'Internal notes', type: 'textarea' },
    ],
    revalidate: [],
  },
  {
    key: 'reviews',
    group: 'Inbox',
    title: 'Agent reviews',
    singular: 'review',
    description: 'Reviews wait here until you approve them. Only approved reviews appear on agent pages.',
    table: 'agent_reviews',
    listColumns: [
      { name: 'created_at', label: 'Received', format: 'date' },
      { name: 'author_name', label: 'From' },
      { name: 'rating', label: 'Rating', format: 'stars' },
      { name: 'status', label: 'Status', format: 'status' },
    ],
    searchColumns: ['author_name', 'body'],
    orderBy: { column: 'created_at', ascending: false },
    canCreate: false,
    canDelete: true,
    fields: [
      { name: 'agent_id', label: 'Agent', type: 'select', optionsFrom: 'agents', readOnly: true },
      { name: 'author_name', label: 'From', type: 'text', readOnly: true, half: true },
      { name: 'author_contact', label: 'Contact (private)', type: 'text', readOnly: true, half: true },
      { name: 'rating', label: 'Rating', type: 'number', readOnly: true, half: true },
      { name: 'context', label: 'Context', type: 'text', readOnly: true, half: true },
      { name: 'body', label: 'Review', type: 'textarea', readOnly: true },
      { name: 'status', label: 'Decision', type: 'select', required: true, options: opts(['pending', 'Pending'], ['approved', 'Approved (published)'], ['rejected', 'Rejected']) },
    ],
    revalidate: ['/agents'],
  },
  {
    key: 'applications',
    group: 'Inbox',
    title: 'Agent applications',
    singular: 'application',
    description: 'People who applied on Become an Akristal agent.',
    table: 'agent_applications',
    listColumns: [
      { name: 'created_at', label: 'Received', format: 'date' },
      { name: 'full_name', label: 'Name' },
      { name: 'city', label: 'City' },
      { name: 'years_experience', label: 'Years' },
      { name: 'status', label: 'Status', format: 'status' },
    ],
    searchColumns: ['full_name', 'email', 'phone', 'city'],
    orderBy: { column: 'created_at', ascending: false },
    canCreate: false,
    canDelete: true,
    fields: [
      { name: 'full_name', label: 'Name', type: 'text', readOnly: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true, half: true },
      { name: 'email', label: 'Email', type: 'text', readOnly: true, half: true },
      { name: 'city', label: 'City', type: 'text', readOnly: true, half: true },
      { name: 'years_experience', label: 'Years of experience', type: 'number', readOnly: true, half: true },
      { name: 'areas', label: 'Areas', type: 'text', readOnly: true },
      { name: 'specialties', label: 'Specialities', type: 'tags', readOnly: true },
      { name: 'languages', label: 'Languages', type: 'tags', readOnly: true },
      { name: 'licence_number', label: 'Licence', type: 'text', readOnly: true, half: true },
      { name: 'cv_url', label: 'CV link', type: 'url', readOnly: true, half: true },
      { name: 'message', label: 'Message', type: 'textarea', readOnly: true },
      { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: opts(['new', 'New'], ['reviewing', 'Reviewing'], ['interview', 'Interview'], ['accepted', 'Accepted'], ['declined', 'Declined']) },
      { name: 'admin_notes', label: 'Internal notes', type: 'textarea' },
    ],
    revalidate: [],
  },
  {
    key: 'home-settings',
    group: 'Settings',
    title: 'Home page',
    singular: 'home page settings',
    description: 'The big headline, tagline and photo at the top of the home page.',
    table: 'site_settings',
    settingKey: 'home',
    listColumns: [],
    searchColumns: [],
    orderBy: { column: 'key', ascending: true },
    canCreate: false,
    canDelete: false,
    fields: [
      { name: 'heroTitle', label: 'Headline', type: 'text', required: true, help: 'Shown in capitals, e.g. "Kigali & beyond". Keep it short.' },
      { name: 'tagline', label: 'Tagline', type: 'text', required: true },
      { name: 'heroImageUrl', label: 'Hero photo', type: 'image', required: true, help: 'Wide landscape photo, at least 2400 pixels across.' },
      { name: 'heroImageAlt', label: 'Photo description', type: 'text', help: 'Describe the photo for people using screen readers.' },
    ],
    revalidate: ['/'],
    viewHref: () => '/',
  },
  {
    key: 'agent-programme',
    group: 'Settings',
    title: 'Agent programme',
    singular: 'agent programme',
    description: 'Commission levels and questions on the Become an Akristal agent page.',
    table: 'site_settings',
    settingKey: 'agent_programme',
    listColumns: [],
    searchColumns: [],
    orderBy: { column: 'key', ascending: true },
    canCreate: false,
    canDelete: false,
    fields: [
      { name: 'commissionPct', label: 'Typical commission on a sale (%)', type: 'number', step: 0.1, required: true },
      {
        name: 'tiers',
        label: 'Agent levels',
        type: 'list',
        itemLabel: 'level',
        fields: [
          { name: 'name', label: 'Level', type: 'text' },
          { name: 'share', label: 'Agent share of commission (%)', type: 'number' },
          { name: 'requirement', label: 'How to reach it', type: 'text' },
        ],
      },
      {
        name: 'faqs',
        label: 'Questions',
        type: 'list',
        itemLabel: 'question',
        fields: [
          { name: 'q', label: 'Question', type: 'text' },
          { name: 'a', label: 'Answer', type: 'textarea' },
        ],
      },
    ],
    revalidate: ['/join'],
    viewHref: () => '/join',
  },
]

export function getResource(key: string) {
  return resources.find((r) => r.key === key) ?? null
}
