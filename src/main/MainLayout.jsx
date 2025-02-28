/* eslint-disable react/prop-types */
import { useState } from 'react'
import Modal from '../components/Modal'
import { SimpleNavbar } from '../components/SimpleNavbar'

export default function MainLayout(props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="">
        <SimpleNavbar toggleModal={() => setShowModal(true)} />
        <main className="content relative">
            {props.children}

            { showModal && <Modal isOpen={true} activeTab={""} toggleActiveTable={() => setShowModal(false)}>
              <iframe src="https://globalsearoutes.net/the-project/" frameBorder="0" height={"100%"} width={"100%"}></iframe>
            </Modal> }
        </main>

        
    </div>
  )
}
