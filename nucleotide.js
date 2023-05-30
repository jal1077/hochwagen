const query = 'QUERY_SEQUENCE'; // Replace with  actual query sequence
const database = 'nr'; // Replace with the name of the database I want to search
const program = 'blastp'; // Replace with the BLAST program I want to use

const url = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&QUERY=${query}&DATABASE=${database}&PROGRAM=${program}`;

fetch(url)
  .then(response => response.text())
  .then(result => console.log(result))
  .then(data => {
    const rid = data.match(/RID = (\w+)/)[1]; // Extract the Request ID (RID) from the response
    console.log(`Search submitted with RID ${rid}`);

    // Poll for the status of the search and retrieve results when they're ready
    const pollInterval = setInterval(() => {
      const statusUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${rid}`;
      
      fetch(statusUrl)
        .then(response => response.text())
        .then(statusData => {
          const status = statusData.match(/Status=(.+)$/)[1]; // Extract the current status from the response
          console.log(`Search status for RID ${rid}: ${status}`);
          
          if (status === 'READY') {
            clearInterval(pollInterval); // Stop polling
            const resultsUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=JSON2&RID=${rid}`;
            fetch(resultsUrl)
              .then(response => response.json())
              .then(jsonData => {
                console.log(jsonData); // Do something with the search results
              })
              .catch(error => console.error(error));
          }
        })
        .catch(error => console.error(error));
    }, 5000); // Poll every 5 seconds
  })
  .catch(error => console.error(error));
