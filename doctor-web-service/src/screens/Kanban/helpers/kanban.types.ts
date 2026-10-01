export interface ProductService {
  id: number
  product_type: string
  product_name: string
  product_description: string
  product_image: string
  product_category_id: number
  product_category_name: string
  profile_id: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: number
  name: string
  description: string
  profile_id: number
  is_default: boolean
}
