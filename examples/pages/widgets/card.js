import { uuid, slugify } from '../shared/util.js'

export default function card({ div }, prefix, obj, items, extra) {
  const id = obj.id ? obj.id : uuid()

  return div(
    `#${prefix}-${id} .${prefix} .card`,
    { obj },
    items.map((item) => {
      const slug = slugify(item[0])
      return div(
        `.${prefix}-${slug} .${prefix}-item .card-item`,
        [
          div(
            `.${prefix}-item-title .${prefix}-${slug}-item-title .card-item-title`,
            item[0] + ': ',
          ),
          div(
            `.${prefix}-item-value .${prefix}-${slug}-item-value .card-item-value`,
            item[1],
          ),
        ],
        extra,
      )
    }),
  )
}