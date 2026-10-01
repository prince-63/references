import {FunctionComponent} from 'react'
import Notfound from 'components/errorHandler/Notfound'

type RoutePath = {
  value: string
  path: string
  children?: RoutePath[]
}

type RoutePaths = RoutePath[]

type ComponentLookup = {
  [key: string]: FunctionComponent | undefined
}

type Route = {
  path: string
  component: FunctionComponent
  children?: Route[]
}

const generateRoutePaths = (routePaths: RoutePaths, components: ComponentLookup): Route[] => {
  return routePaths.map(({value, children, ...rest}) => {
    const Comp: FunctionComponent | undefined = components[value]
    const route: Route = {
      ...rest,
      component: Comp ? Comp : Notfound,
    }

    if (children) {
      route.children = generateRoutePaths(children, components)
    }

    return route
  })
}

export default generateRoutePaths
