'use client';

import styles from "./page.module.css";
import Dashboard from './components/Dashboard';
import TrainModel from './components/TrainModel';
import { useEffect, useReducer, useRef, useState } from "react";
import { modelReducer } from "./reducers/ModelReducer";
import processedDataReducer from "./reducers/ProcessedDataReducer";
import UploadDataSet from "./components/UploadDataset";
import CompileModel from "./components/CompileModel";

import {Sequential, sequential} from '@tensorflow/tfjs';
import { DataFrame } from "danfojs";
import FitModel from "./components/FitModel";
import DownloadModel from "./components/DownloadModel";
import InfoModal from "./modals/InfoModal";
import ShowInfoModal from "./types/ShowInfoModalTypes";

export default function Home() {
  
  const [modelState, modelDispatcher] = useReducer(modelReducer, {nlayers:1, layers:[{units:1,inputShape:0, activationFunction:"sigmoid"}], optimizer: "default", lossFunction: "default", learningRate: 0.1, batchSize: 32, epochs: 0});
  const [model, setModel] = useState<Sequential>(sequential())
  const [data, setData] = useState<DataFrame|null>(null)
  const [processedData, processedDataDispatcher] = useReducer(processedDataReducer,{features:undefined,target:undefined,labelEncoders:[]});
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modelTrained, setModelTrained] = useState<boolean>(false)
  const [showInfoModal, setShowInfoModal] = useState<ShowInfoModal>({visibility:false, message:"Informational Heading", description:"Informational Desctiption", type:'info'})
  const infoModalDisableTimer = useRef<NodeJS.Timeout | null>(null)

  const showModalRef = useRef(showModal);

  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  useEffect(() => {
    function closeModal() {
      if (showModalRef.current) {
        setShowModal(false);
      }
    }

    setTimeout(() => window.addEventListener('click',closeModal,false), 0);
    console.log("Event Listener Added")

    return () => {
      window.removeEventListener('click',closeModal,false)
      console.log("Event Listener Removed")
    }
  }, [])

  useEffect(() => {
    setModel(sequential())
  }, [])

  useEffect(() => {
    window.addEventListener("click",()=>{
      setShowInfoModal({visibility:false, message: "Informational Heading", description: "Informational Desctiption", type: 'info'})
    })
  }, [])

  useEffect(() => {
    if (showInfoModal.visibility === true && !infoModalDisableTimer.current) {
      infoModalDisableTimer.current = (setTimeout(() => {
        setShowInfoModal({visibility:false, message: "Informational Heading", description: "Informational Desctiption", type:'info'})
        infoModalDisableTimer.current = null
      }, 6000));
    }
  }, [showInfoModal])

  return (
    <>
    <Dashboard styles={styles} />
    <hr />
    <TrainModel styles={styles} modelStateControls={{modelState,modelDispatcher}} />
    <hr />
    <UploadDataSet styles={styles} modelStateControls={{modelState,modelDispatcher}} modelControls={{model,setModel}} dataControls={{data, setData}} modalStateControls={{showModal, setShowModal}} processedDataControls={{processedData, processedDataDispatcher}} setShowInfoModal={setShowInfoModal} />
    <hr />
    <CompileModel styles={styles} modelStateControls={{modelState,modelDispatcher}} modelControls={{model,setModel}} setShowInfoModal={setShowInfoModal}/>
    <hr />
    <FitModel styles={styles} dataControls={{data, setData}} modelStateControls={{modelState,modelDispatcher}} modelControls={{model,setModel}} processedDataControls={{processedData, processedDataDispatcher}} setModelTrained={setModelTrained} setShowInfoModal={setShowInfoModal}/>
    <hr />
    <DownloadModel styles={styles} modelTrained={modelTrained} setShowInfoModal={setShowInfoModal} />
    <InfoModal styles={styles} showInfoModal={showInfoModal} />
    </>
  );
}
