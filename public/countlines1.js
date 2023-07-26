// Função para contar as linhas de código do repositório
const countLinesOfCode = () => {
    const repoUrl = document.getElementById('repoUrl').value;
    const ownerRepo = repoUrl.match(/github\.com\/(.+)\/(.+)/);
  
    if (!ownerRepo) {
      alert('URL inválida. Certifique-se de que é uma URL válida do repositório do GitHub.');
      return;
    }
  
    const owner = ownerRepo[1];
    const repoName = ownerRepo[2];
  
    axios.get(`https://api.github.com/repos/${owner}/${repoName}`)
      .then(response => {
        if (response.status === 200) {
          return axios.get(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${response.data.default_branch}?recursive=1`);
        } else {
          throw new Error(`O repositório '${repoUrl}' não existe.`);
        }
      })
      .then(response => {
        // Check if the response contains the 'tree' field
        if (!response.data.tree || !Array.isArray(response.data.tree)) {
          throw new Error('Failed to get the list of files from the repository.');
        }
  
        const filePaths = response.data.tree.filter(item => item.type === 'blob').map(item => item.path);
        const filePromises = filePaths.map(filePath => axios.get(`https://raw.githubusercontent.com/${owner}/${repoName}/master/${filePath}`, { responseType: 'text' }));
  
        return Promise.all(filePromises);
      })
      .then(fileResponses => {
        let linesOfCode = 0;
        for (const fileResponse of fileResponses) {
          linesOfCode += fileResponse.data.split('\n').length;
        }
  
        alert(`O repositório '${repoUrl}' contém ${linesOfCode} linhas de código.`);
      })
      .catch(error => {
        alert(`Erro ao verificar o repositório: ${error.message}`);
      });
  };
  
  // Adicionar o evento de clique ao botão "Contar Linhas"
  document.getElementById('countButton').addEventListener('click', () => {
    console.log('Botão clicado!')
    countLinesOfCode();
  });