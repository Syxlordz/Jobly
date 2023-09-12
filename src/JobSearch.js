import { jobTemplate } from './templates.js';
import { extractFormData, getCurrencySymbol } from './utils.js';


export class JobSearch {

  constructor(searchFormSelector, resultsContainerSelector, loadingElementSelector) {
    this.searchForm = document.querySelector(searchFormSelector);
    this.resultsContainer = document.querySelector(resultsContainerSelector);
    this.loadingElement = document.querySelector(loadingElementSelector);
  }

  setCityCountry() {
    const username = "Syxlordz";
    const { search, location } = extractFormData(this.searchForm);

    const url = `https://secure.geonames.org/searchJSON?q=${location}&maxRows=1&username=${username}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.geonames.length > 0) {
          this.countryCode = data.geonames[0].countryCode.toLowerCase();
          console.log(this.countryCode)
          this.setCurrencySymbol();
        } else {
          console.log(`No se pudo obtener el país para ${cityName}.`);
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });

  }

  setCountryCode() {

    this.countryCode = 'gb';
    this.setCurrencySymbol();

    fetch('https://ip-api.com/json')
      .then(results => results.json())
      .then(results => {
        this.countryCode = results.countryCode.toLowerCase();
        this.setCurrencySymbol();
      });
  }

  setCurrencySymbol() {
    this.currencySymbol = getCurrencySymbol(this.countryCode);
  }

  configureFormListener() {

    this.searchForm.addEventListener('submit', (event) => {
      this.setCityCountry();
      event.preventDefault();
      this.startLoading();
      this.resultsContainer.innerHTML = '';
      const { search, location } = extractFormData(this.searchForm);
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '0b4bc7ad15mshad14a6f1e987516p1cc883jsn114a2b0b82eb',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      };

      const query = `trabajos de ${search} en ${location}, ${this.countryCode}`;
      const num_pages = '1';
      const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=${num_pages}`;
      try {
        fetch(url, options)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(({ data }) => {
            this.stopLoading();
            return data
              .map(job => jobTemplate(job, this.currencySymbol))
              .join('');
          })
          .then(jobs => this.resultsContainer.innerHTML = jobs)
          .catch(() => this.stopLoading());
      } catch (error) {
        console.error(error);
      }

    })
  };

  startLoading() {
    this.loadingElement.classList.add('loading');
  }

  stopLoading() {
    this.loadingElement.classList.remove('loading');
  }
}
