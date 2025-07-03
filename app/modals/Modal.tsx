'use client';
import { DataFrame, LabelEncoder, Series } from "danfojs";
import { ChangeEvent, useState } from "react";
import { ModelState, ModelAction } from "../types/ModelStateControlTypes";
import { ProcessedDataState, ProcessedDataAction } from "../types/ProcessedDataStateControlTypes";
import ShowInfoModal from "../types/ShowInfoModalTypes";

type ModalProps = {
    styles: { readonly [key: string]: string; },
    modalStateControls: {
      showModal: boolean,
      setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    },
    dataControls: {
        data: DataFrame | null,
        setData: React.Dispatch<React.SetStateAction<DataFrame|null>>
    },
    modelStateControls: {
        modelState : ModelState,
        modelDispatcher: React.ActionDispatch<[action:ModelAction]>
    },
    processedDataControls:{
        processedData: ProcessedDataState,
        processedDataDispatcher: React.ActionDispatch<[action:ProcessedDataAction]>
    },
    setShowInfoModal: React.Dispatch<React.SetStateAction<ShowInfoModal>>
}

export default function Modal({styles, modalStateControls, dataControls, modelStateControls, processedDataControls, setShowInfoModal}: ModalProps) {

  const [dropColumns, setdropColumns] = useState<Array<number>>([])
  const [targetColumns, settargetColumns] = useState<Array<number>>([])

  function changeDropColumns(e:ChangeEvent<HTMLInputElement>, i:number) {
    if (e.target.checked) {
      setdropColumns(pS=> {
        const nS = [...pS];
        if (!nS.includes(i)) {
          nS.push(i);
        }
        return nS;
      });
    }
    else{
      setdropColumns(pS=> {
        const nS = [...pS];
        return nS.filter(v=>v!==i)
      });
    }
  }

  function changeTargetColumns(e:ChangeEvent<HTMLInputElement>, i:number) {
    if (e.target.checked) {
      settargetColumns(pS=> {
        const nS = [...pS];
        if (!nS.includes(i)) {
          nS.push(i);
        }
        return nS;
      });
    }
    else{
      settargetColumns(pS=> {
        const nS = [...pS];
        return nS.filter(v=>v!==i)
      });
    }
  }

  function preprocessData() {

    // First Close the Modal
    modalStateControls.setShowModal(false);

    // Check if Target Columns are equal in number to the output shape

    if(modelStateControls.modelState.layers[modelStateControls.modelState.nlayers-1].units !== targetColumns.length){
      setShowInfoModal({visibility: true, message: "Data Processing Error", description:"Number of Target Columns should be equal to the number of units of the last layer!", type:'error'});
      return;
    }

    // Check if the intersection of drop columns and target columns is empty

    const dropTargetIntersection = dropColumns.filter(v =>{
      return targetColumns.includes(v)
    })

    if (dropTargetIntersection.length !== 0) {
      setShowInfoModal({visibility: true, message: "Data Processing Error", description:"A column can either be a target column or it can be a column which is to be dropped, but both selected at the same time!", type:'error'});
      return;
    }

    let dPreprocessingFailure:boolean = false;

    // Drop the required columns

    const df: DataFrame|undefined = dataControls.data?.copy()

    let dcolumns = df?.columns
    let tColumns = df?.columns
    let fColumns = df?.columns

    dcolumns = dcolumns?.filter((_,i)=>{
      return dropColumns.includes(i);
    })
    
    // Features and target split
    
    fColumns = fColumns?.filter((_,i)=>{
      return !targetColumns.includes(i);
    })
    tColumns = tColumns?.filter((_,i)=>{
      return targetColumns.includes(i);
    })

    const features: DataFrame|undefined = df?.drop({columns:tColumns?.concat(dcolumns??[]), inplace: false});
    const target: DataFrame|undefined = df?.drop({columns:fColumns?.concat(dcolumns??[]), inplace: false});

    if(features) { modelStateControls.modelDispatcher({type:"set_input_shape", payload:{index:0, value: (features.columns.length).toString()}}) }

    // Label Encode Text Columns in Features

    features?.columns.forEach(c=>{
      let flag:boolean = false;
      let anyflag:boolean = false;

      const col:Series = features[c];

      if(col.values.every((v)=>{
        return isNaN(v as number)
      })){
        flag = true;
      }

      if (col.values.some((v)=>{
        return isNaN(v as number)
      })) {
        anyflag = true;
      }

      if(flag === false && anyflag === true){
        setShowInfoModal({visibility:true, message: "Data Processing Error", description: "In a column either all values should be numeric or all values should be string, but found some to be string and some to be numbers in a single column. Check your dataset!", type:'error'})
        dPreprocessingFailure = true;
      }

      else if (flag) {
        const le = new LabelEncoder();
        const encoded: number[] = le.fitTransform(col.values)
        features[c] = encoded;
      }
      else{
        features[c] = col.values;
      }

    }, {axis: 1})

    if(dPreprocessingFailure){ return }

    // Label Encode Text Columns in Target (but also keep the labels safe to return them as predictions)

    target?.columns.forEach(c=>{
      let flag:boolean = false;
      let anyflag:boolean = false;

      const col:Series = target[c];

      if(col.values.every((v)=>{
        return isNaN(v as number)
      })){
        flag = true;
      }

      if (col.values.some((v)=>{
        return isNaN(v as number)
      })) {
        anyflag = true;
      }

      if(flag === false && anyflag === true){
        setShowInfoModal({visibility:true, message: "Data Processing Error", description: "In a column either all values should be numeric or all values should be string, but found some to be string and some to be numbers in a single column. Check your dataset!", type:'error'})
        dPreprocessingFailure = true;
      }

      else if (flag) {
        const le = new LabelEncoder();
        const fittedEncoder: LabelEncoder = le.fit(col.values);
        processedDataControls.processedDataDispatcher({type: "add_label_encoder", payload: {value: fittedEncoder}})
        const encoded: number[] = fittedEncoder.transform(col.values)
        target[c] = encoded;
      }
      else{
        target[c] = col.values;
      }

    }, {axis: 1})

    if(dPreprocessingFailure){ return }

    if(features) { processedDataControls.processedDataDispatcher({type:"add_features", payload:{value:features}}) }
    else { setShowInfoModal({visibility: true, message: "Data Processing Error", description: "Some Error Occured during data processing!", type:'error'}); return}

    if(target) { processedDataControls.processedDataDispatcher({type:"add_target", payload:{value:target}}) }
    else { setShowInfoModal({visibility: true, message: "Data Processing Error", description: "Some Error Occured during data processing!", type:'error'}); return}

    setShowInfoModal({visibility:true, message:"Dataset Uploaded", description: "Data Processing was successful and the dataset was uploaded successfully!", type:'success'})
  } 

  return (
    <section className={modalStateControls.showModal ? styles.dataSetCheckModalTrue : styles.dataSetCheckModalFalse} onClick={e=> e.stopPropagation()}>
      <h4 className={styles.datasetCheckHeading}>Dataset Check</h4>
      <h6>This is how your data will be fed into the model</h6>
      <h6>You can select which columns to drop here</h6>
      <div className={styles.tableWrapper}>
      <table>
        <tbody>
          <tr>
          {
            (()=> {
              const values = [];
              for (let i = 0; i < (modelStateControls.modelState.layers[0].inputShape as number); i++) {
                 values.push(<td key={i}>Drop ?<input type="checkbox" name="" id="" onChange={e=>changeDropColumns(e, i)} disabled={targetColumns.includes(i)}/></td>);
              }
              return values;
            })()
          }
          </tr>
          <tr>
          {
            (()=> {
              const values = [];
              for (let i = 0; i < (modelStateControls.modelState.layers[0].inputShape as number); i++) {
                 values.push(<td key={i}>Is Target ?<input type="checkbox" name="" id="" onChange={e=>changeTargetColumns(e, i)} disabled={dropColumns.includes(i)} /></td>);
              }
              return values;
            })()
          }
          </tr>
          <tr>
            {
              (()=>{
              return dataControls.data?.columns.every(e=>isNaN(+e))===true ? (dataControls.data?.columns.map((elem, idx) =>{return (<td key={idx}>{elem}</td>)})):<></>
              })()
            }
          </tr>
          {
            (dataControls.data?.values as (string | number | boolean)[][])?.map((row, ridx)=> {
              return (<tr key={ridx}>
              {row.map((value, cidx) => <td key={cidx}>{value}</td>)}
              </tr>)
            })
          }
        </tbody>
      </table>
      </div>
      <h6>NOTE: Columns containing text only values will be auto-label encoded</h6>
      <button type="button" onClick={e=>{e.stopPropagation(); preprocessData()}}>Confirm</button>
      <button type="button" onClick={e=> {e.stopPropagation(); modalStateControls.setShowModal(false)}}>Cancel</button>
    </section>
  );
}

