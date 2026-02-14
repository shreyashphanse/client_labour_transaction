export const stations = ["Vasai", "Nalasopara", "Virar"];

export const getStationIndex = (station) => {
  return stations.indexOf(station);
};

export const isStationOverlap = (jobFrom, jobTo, labourFrom, labourTo) => {
  const jobStart = getStationIndex(jobFrom);
  const jobEnd = getStationIndex(jobTo);

  const labourStart = getStationIndex(labourFrom);
  const labourEnd = getStationIndex(labourTo);

  if (
    jobStart === -1 ||
    jobEnd === -1 ||
    labourStart === -1 ||
    labourEnd === -1
  )
    return false;

  return jobStart <= labourEnd && labourStart <= jobEnd;
};
