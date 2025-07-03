import { Sequential } from "@tensorflow/tfjs";
import { ModelState, ModelAction } from "../types/ModelStateControlTypes";
import { readCSV, DataFrame } from "danfojs";
import { useState } from "react";
import Modal from '../modals/Modal';
import { ProcessedDataAction, ProcessedDataState } from "../types/ProcessedDataStateControlTypes";
import ShowInfoModal from "../types/ShowInfoModalTypes";

type UploadDatasetProps = {
    styles: { readonly [key: string]: string; },
    modelStateControls: {
        modelState : ModelState,
        modelDispatcher: React.ActionDispatch<[action:ModelAction]>
    }
    modelControls: {
        model: Sequential,
        setModel: React.Dispatch<React.SetStateAction<Sequential>>
    }

    dataControls: {
        data: DataFrame | null,
        setData: React.Dispatch<React.SetStateAction<DataFrame|null>>
    }

    modalStateControls:{
        showModal: boolean,
        setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    }

    processedDataControls:{
        processedData: ProcessedDataState,
        processedDataDispatcher: React.ActionDispatch<[action:ProcessedDataAction]>
    },
    setShowInfoModal: React.Dispatch<React.SetStateAction<ShowInfoModal>>
}

export default function UploadDataset({styles, modelStateControls, dataControls, modalStateControls, processedDataControls, setShowInfoModal}: UploadDatasetProps) {

    const [meta, setMeta] = useState({hasHeader:false})
    const [file, setFile] = useState<File | null>(null)

    async function fetchDataFromFile(file:File|null) {
        if(file){
            let parsedFile = undefined;

            try {
                parsedFile = await readCSV(file, {header: meta.hasHeader})
            } catch (error) {
                console.log(error)
            }

            if(parsedFile && parsedFile.columns instanceof Array){
                dataControls.setData(parsedFile)
                modelStateControls.modelDispatcher({type:"set_input_shape", payload:{index:0, value: (parsedFile.columns.length).toString()}})
                modalStateControls.setShowModal(true);
            }
            else{
                setShowInfoModal({visibility:true, message:"CSV Parsing Error", description: "Some Errors Occured during parsing the file! For exact error details check the console", type:'error'});
            }
        }
        else{
            setShowInfoModal({visibility:true, message:"No file selected!", description: "Select a file first!", type:'info'});
        }
    }

    return (
        <>
        <section className={styles.uploadDatasetSection}>
            <h1>Upload Dataset</h1>
            <article className={styles.datasetUpload}>
                <h3>Upload your Dataset here first</h3>
                <div className={styles.datasetUploadSubSection}>
                    <input type="file" accept=".csv, text/csv" name="" id="datasetUpload" onChange={e=> e.target.files && e.target.files[0] ? setFile(e.target.files[0]) : e.preventDefault }/>
                    <div className={styles.hasHeader}>
                        <h4 className={styles.hasHeader}>Has Header ?</h4>
                        <input type="checkbox" name="" id="hasHeader" onChange={e=>setMeta({hasHeader: e.target.checked})}/>
                    </div>
                </div>
                <button type="button" className={styles.uploadButton} onClick={e=>{e.stopPropagation(); fetchDataFromFile(file)}}>Upload Dataset</button>
                <h4>After uploading the Dataset checks run on it to make sure that it is in the correct format. Then input shape is calculated</h4>
            </article>
        </section>
        <Modal styles={styles} modalStateControls={{showModal:modalStateControls.showModal, setShowModal:modalStateControls.setShowModal}} dataControls={dataControls}  modelStateControls={{modelState:modelStateControls.modelState, modelDispatcher:modelStateControls.modelDispatcher}} processedDataControls={{processedData:processedDataControls.processedData, processedDataDispatcher:processedDataControls.processedDataDispatcher}} setShowInfoModal={setShowInfoModal} />
        </>
    )
}
