import {useSearchParams} from 'react-router-dom'
import {getRole} from 'utils/ConstFunctions'

export default (module: any) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'

  if (module && isEdit) {
    return {
      name: getRole(module?.name) ?? '',
      description: module?.description ?? '',
      sub_role_tag: module?.cloned_from_sub_role?.id ? 'CUSTOM' : module?.sub_role_tag,
      plan_id: module?.id,
      clone_from_sub_role_id: module?.cloned_from_sub_role?.id ?? null,
    }
  } else {
    return {
      name: '',
      description: '',
      sub_role_tag: 'CUSTOM',
      plan_id: 0,
      clone_from_sub_role_id: 0,
    }
  }
}
