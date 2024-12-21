/* eslint-disable react/prop-types */
import { SimpleNavbar } from '../components/SimpleNavbar'

export default function MainLayout(props) {
  return (
    <div className="">
        <SimpleNavbar />
        <main className="content relative">
            {props.children}
        </main>
    </div>
  )
}
