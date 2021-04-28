import processList, { ProcessDescriptor }  from 'ps-list'; 

const TIBIA_PROCESS_NAME = 'client.exe';
let tibiaTask: processList.ProcessDescriptor;

export default async (): Promise<ProcessDescriptor> => {
  return new Promise<ProcessDescriptor>(async (resolve, reject) => {
    if (tibiaTask) {
      return resolve(tibiaTask);
    }
    const tasks = await processList();
    tasks.forEach(task => {
      if (task.name === TIBIA_PROCESS_NAME) {
        tibiaTask = task;
      }
    });
    if (!tibiaTask) {
      return reject();
    }
    return resolve(tibiaTask);
  });
};
