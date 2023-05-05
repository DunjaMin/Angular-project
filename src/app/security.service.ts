import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface Filter {
  securityFilterValue: string | undefined;
  propertyName: string;
  propertyType: string;
  operation: number;
}

export interface Security {
  sid?: number;
  name: string;
  ticker: string;
  exchangeId: number;
  currencyId: number;
  underlierSid?: number;
  startDate: Date;
  endDate: Date;
  typeId: number;
  created?: Date;
  lastUpdate?: Date;
  updateUser?: string;
  version?: number;
  underlierSecurity?: string;
}

export interface Equity extends Security {
}

export interface EquityOption extends Security {
  settlementId?: number;
  strike?: number;
  optionStyleId?: number;
  expirationTime?: Date;
  sideId?: number;
}
export interface Currency {
  currencyId: number;
  name: string;
  rate: number;
}
export interface Exchange {
  exchangeId: number;
  name: string;
}
export interface SecurityType {
  typeId: number;
  name: string;
}

@Injectable()
export class SecurityService {

  filters: Filter[] = [];


  constructor(
    private http: HttpClient
  ) { }

  private apiURL = "https://localhost:7074/api";
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  public securityFilter(
    form: Partial<{
      sid: number;
      securityType: number;
      ticker: string | undefined;
      selectTypeTicker: number | null;
      description: string;
      selectTypeDescription: number | null;
      exchangeId: string;
    }>
  ): Observable<EquityOption[]> {

    const typeId = form.securityType;
    const descriptionId = Number(form.selectTypeDescription);
    const tickerId = Number(form.selectTypeTicker);

    const textSid = String(form.sid);
    const textExchangeId = form.exchangeId;
    const textType = String(typeId);

    const securityFilter: Filter = {
      securityFilterValue: textSid,
      propertyName: "Sid",
      propertyType: "int",
      operation: 0
    };
    const typeFilter: Filter = {
      securityFilterValue: textType,
      propertyName: "TypeId",
      propertyType: "int",
      operation: 0
    };
    const tickerFilter: Filter = {
      securityFilterValue: form.ticker,
      propertyName: "Ticker",
      propertyType: "string",
      operation: tickerId
    };
    const descriptionFilter: Filter = {
      securityFilterValue: form.description,
      propertyName: "Name",
      propertyType: "string",
      operation: descriptionId
    };
    const exchangeFilter: Filter = {
      securityFilterValue: textExchangeId,
      propertyName: "ExchangeId",
      propertyType: "int",
      operation: 0
    };

    let filters: Filter[] = [];

    if (form.sid != null) {
      filters.push(securityFilter);
    }
    if (form.ticker != null) {
      filters.push(tickerFilter);
    }
    if (form.description != null) {
      filters.push(descriptionFilter)
    }
    if (form.exchangeId != null) {
      filters.push(exchangeFilter)
    }
    if (form.securityType != null) {
      filters.push(typeFilter)
    }

    let body = JSON.stringify(filters);

    const options = {
      headers: new HttpHeaders(
        {
          'accept': 'text/plain' as const,
          'Content-Type': 'application/json-patch+json' as const,
          responseType: 'text' as const
        }
      )
    };
    return this.http.post<EquityOption[]>(this.apiURL + '/SecurityFilter', body, options);
  }

  public getSecurity(sid: number): Observable<EquityOption> {
    return this.http.get<EquityOption>(this.apiURL + '/Securities/Get-By-Sid/' + sid);
  }

  public getTypes(): Observable<SecurityType[]> {
    return this.http.get<SecurityType[]>(this.apiURL + '/Type/Get-All');
  }

  public getExchanges(): Observable<Exchange[]> {
    return this.http.get<Exchange[]>(this.apiURL + '/Exchanges/Get-All-Exchanges');
  }

  public getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(this.apiURL + '/Currencies/Get-All-Currencies');
  }

  public addSecurity(
    value: EquityOption) {

    const options = {
      headers: new HttpHeaders(
        {
          'accept': 'text/plain' as const,
          'Content-Type': 'application/json-patch+json' as const,
          responseType: 'text' as const
        }
      )
    };
    return this.http.post<EquityOption>(this.apiURL + '/Securities/Create-New-Security', value, options);
  }

  public updateEquity(value: EquityOption) {

    const httpOptions = {
      headers: new HttpHeaders(
        {
          'accept': '*/*' as const,
          'Content-Type': 'application/json-patch+json' as const,
          responseType: 'text' as const
        }
      )
    };
    return this.http.put<EquityOption>(this.apiURL + '/Securities/Update-By-Sid', value, httpOptions)
  }

  public returnUnderliers(): Observable<Equity[]> {

    const typeFiler: Filter = {
      securityFilterValue: '1',
      propertyName: "TypeId",
      propertyType: "int",
      operation: 0
    };
    let filters: Filter[] = [];
    filters.push(typeFiler);

    let body = JSON.stringify(filters);

    const options = {
      headers: new HttpHeaders(
        {
          'accept': 'text/plain' as const,
          'Content-Type': 'application/json-patch+json' as const,
          responseType: 'text' as const
        }
      )
    };
    return this.http.post<Equity[]>(this.apiURL + '/SecurityFilter', body, options);
  }
}
