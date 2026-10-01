import {Product} from '../components/types'

export default (data: Product | null) => {
  const value = data
    ? {
        product: data.product_type ?? '',
        name: data.product_name ?? '',
        category: data.product_category_id ?? '',
        description: data.product_description ?? '',
        photo: [data.product_image],
        enabled: data.is_product_enabled ?? true,
      }
    : {
        product: '',
        name: '',
        category: '',
        description: '',
        photo: [],
        enabled: true,
      }

  return value
}
