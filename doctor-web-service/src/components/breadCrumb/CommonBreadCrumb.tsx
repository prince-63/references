import {Breadcrumb} from 'antd'
import {BreadcrumbProps, ItemType} from 'antd/es/breadcrumb/Breadcrumb'
import React from 'react'
import {Link} from 'react-router-dom'

interface CommonBreadCrumbProps extends BreadcrumbProps {
  items?: Array<{path: string; title: string}>
}

const CommonBreadCrumb: React.FC<CommonBreadCrumbProps> = ({
  children,
  items,
  separator,
  ...rest
}) => {
  const itemRender = (route: ItemType, params: any, items: ItemType[]) => {
    const last = items.indexOf(route) === items.length - 1
    return last ? (
      <span className={`text-sm font-medium md:text-2xl md:font-semibold text-black `}>
        {route.title}
      </span>
    ) : (
      <Link to={route.path ?? ''}>
        <span className='text-sm font-medium md:text-2xl md:font-semibold text-textColor '>
          {route.title}
        </span>
      </Link>
    )
  }
  return (
    <Breadcrumb separator={separator} items={items} itemRender={itemRender} {...rest}>
      {children}
    </Breadcrumb>
  )
}

export default CommonBreadCrumb
