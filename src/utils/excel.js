const XlsxStreamReader = require('xlsx-stream-reader');
const XLSX = require('xlsx');
const fs = require('fs');
const moment = require('moment');

const ExcelHandler = {
  async streamConvertSheetToJson(filePath, fileId, year, startDate, endDate, callback) {
    try {
      const jsonData = [];
      let headers = [];
      const batchSize = 1000;

      await new Promise((resolve, reject) => {
        const workBookReader = new XlsxStreamReader();

        workBookReader.on('worksheet', async (workSheetReader) => {
          if (workSheetReader.id > 1) {
            workSheetReader.skip();
            return;
          }

          workSheetReader.on('row', async (row) => {
            if (row.attributes.r == 1) {
              headers = row.values;
              return;
            }

            const rowData = {};
            row.values.forEach((value, index) => {
              rowData[headers[index]] = value;
            });
            jsonData.push(rowData);

            if (jsonData.length >= batchSize) {
              const data = [...jsonData];
              jsonData.length = 0;
              try {
                const dataToProcess = await ExcelHandler.trimKeys([...data]);
                //jsonData = [];
                await callback(dataToProcess, fileId, year, startDate, endDate);
              } catch (error) {
                reject(error);
                workBookReader.abort(); // Stops reading the workbook
                workSheetReader.abort(); // Stops reading the worksheet
              }
            }
          });

          workSheetReader.on('end', async () => {
            console.log('Finished reading the worksheet');
            // Process remaining data in jsonData
            if (jsonData.length > 0) {
              try {
                const trimmedData = await ExcelHandler.trimKeys([...jsonData]);
                await callback(trimmedData, fileId, year, startDate, endDate);
              } catch (error) {
                return reject(error);
              }
            }
            resolve();
          });

          workSheetReader.on('error', (error) => {
            console.error('Error reading worksheet:', error);
            reject(error);
            workBookReader.abort(); // Stops reading the workbook
            workSheetReader.abort(); // Stops reading the worksheet
          });

          workSheetReader.process();
        });

        workBookReader.on('end', () => {
          console.log('Finished reading the workbook');
        });

        workBookReader.on('error', (error) => {
          console.error('Error reading workbook:', error);
          reject(error);
        });

        fs.createReadStream(filePath).pipe(workBookReader);
      });

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async convertSheetToJson(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const trimData = await this.trimKeys(jsonData);
    return trimData;
  },

  async trimKeys(jsonData) {
    try {
      const data = jsonData.map((row) => {
        const trimmedRow = {};
        Object.keys(row).forEach((key) => {
          trimmedRow[key.trim()] = row[key];
        });
        return trimmedRow;
      });
      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  removeFile(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    } else {
      console.log(`file with path ${path} not exist`);
    }
  },

  extractDataFomBudgetRow(row) {
    const {
      CHAIN_NAME,
      STORE_NAME3,
      DIVISION_NAME,
      DEPT_GROUP,
      LEGACY_DEPARTMENT,
      JAN,
      FEB,
      MAR,
      APR,
      MAY,
      JUN,
      JULY,
      AUG,
      SEP,
      OCT,
      NOV,
      DEC,
      Total,
      sector,
      year,
      ...rest
    } = row;

    const data = {};
    if (CHAIN_NAME) data['chainName'] = CHAIN_NAME;
    if (STORE_NAME3) data['storeName3'] = STORE_NAME3;
    if (DIVISION_NAME) data['divisionName'] = DIVISION_NAME;
    if (DEPT_GROUP) data['deptGroup'] = DEPT_GROUP;
    if (LEGACY_DEPARTMENT) data['legacyDepartment'] = LEGACY_DEPARTMENT;
    if (JAN || parseInt(JAN) == 0) data['months.jan'] = JAN;
    if (FEB | (parseInt(FEB) == 0)) data['months.feb'] = FEB;
    if (MAR | (parseInt(MAR) == 0)) data['months.mar'] = MAR;
    if (APR | (parseInt(APR) == 0)) data['months.apr'] = APR;
    if (MAY | (parseInt(MAY) == 0)) data['months.may'] = MAY;
    if (JUN | (parseInt(JUN) == 0)) data['months.jun'] = JUN;
    if (JULY | (parseInt(JULY) == 0)) data['months.jul'] = JULY;
    if (AUG | (parseInt(AUG) == 0)) data['months.aug'] = AUG;
    if (SEP | (parseInt(SEP) == 0)) data['months.sep'] = SEP;
    if (OCT | (parseInt(OCT) == 0)) data['months.oct'] = OCT;
    if (NOV | (parseInt(NOV) == 0)) data['months.nov'] = NOV;
    if (DEC | (parseInt(DEC) == 0)) data['months.dec'] = DEC;
    if (Total | (parseInt(Total) == 0)) data['total'] = Total;
    if (sector) data['sector'] = sector;
    if (year) data['year'] = year;
    if (rest['Location Code']) data['locationCode'] = rest['Location Code'];
    if (rest['Budget_Code']) data['budgetCode'] = rest['Budget_Code'];

    return data;
  },

  extractDataFomSalesRow(row, fileId = undefined, year) {
    const {
      CHANNEL_ID,
      CHAIN_NAME,
      STORE,
      STORE_NAME,
      STORE_NAME3,
      BUSINESS_DATE,
      TRAN_SEQ_NO,
      SDS_ORD_KPOS_INV_NO,
      CUSTOMER_ID,
      CUSTOMER_NAME,
      CUST_BRANCH_ID,
      BRANCH_NAME,
      VAN_CUSTOMER_CODE,
      VAN_CUSTOMER_NAME,
      SALESPERSON_ID,
      SALESPERSON_NAME,
      DIVISION,
      DIVISION_NAME,
      BRAND_ID,
      BRAND_NAME,
      DEPT,
      DEPT_NAME,
      CLASS,
      CLASS_NAME,
      SUBCLASS,
      SUB_NAME,
      ITEM,
      BARCODE,
      ITEM_DESC,
      TRAN_TYPE,
      QTY,
      UNIT_RETAIL,
      RESA_VALUE,
      LEGACY_DEPARTMENT,
      PE_DIVSION,
      LOCATION_CODE,
    } = row;

    const data = {};
    if (CHAIN_NAME && DIVISION_NAME) {
      if (CHANNEL_ID !== undefined) data['channelId'] = CHANNEL_ID;
      if (CHAIN_NAME !== undefined) data['chainName'] = CHAIN_NAME;
      if (STORE !== undefined) data['store'] = STORE;
      if (STORE_NAME !== undefined) data['storeName'] = STORE_NAME;
      if (STORE_NAME3 !== undefined) data['storeName3'] = STORE_NAME3;

      if (BUSINESS_DATE !== undefined) {
        const parsedDate = moment.utc(BUSINESS_DATE, 'DD-MMM-YYYY', true);
        if (parsedDate.isValid()) {
          data['businessDate'] = parsedDate;
        }
      }

      if (TRAN_SEQ_NO !== undefined) data['tranSeqNo'] = TRAN_SEQ_NO;
      if (SDS_ORD_KPOS_INV_NO !== undefined)
        data['sdsOrdKposInvNo'] = SDS_ORD_KPOS_INV_NO;
      if (CUSTOMER_ID !== undefined) data['customerId'] = CUSTOMER_ID;
      if (CUSTOMER_NAME !== undefined) data['customerName'] = CUSTOMER_NAME;
      if (CUST_BRANCH_ID !== undefined) data['custBranchId'] = CUST_BRANCH_ID;
      if (BRANCH_NAME !== undefined) data['branchName'] = BRANCH_NAME;
      if (VAN_CUSTOMER_CODE !== undefined)
        data['vanCustomerCode'] = VAN_CUSTOMER_CODE;
      if (VAN_CUSTOMER_NAME !== undefined)
        data['vanCustomerName'] = VAN_CUSTOMER_NAME;
      if (SALESPERSON_ID !== undefined) data['salespersonId'] = SALESPERSON_ID;
      if (SALESPERSON_NAME !== undefined)
        data['salespersonName'] = SALESPERSON_NAME;
      if (DIVISION !== undefined) data['division'] = DIVISION;
      if (DIVISION_NAME !== undefined) data['divisionName'] = DIVISION_NAME;
      if (BRAND_ID !== undefined) data['brandId'] = BRAND_ID;
      if (BRAND_NAME !== undefined) data['brandName'] = BRAND_NAME;
      if (DEPT !== undefined) data['dept'] = DEPT;
      if (DEPT_NAME !== undefined) data['deptName'] = DEPT_NAME;
      if (CLASS !== undefined) data['class'] = CLASS;
      if (CLASS_NAME !== undefined) data['className'] = CLASS_NAME;
      if (SUBCLASS !== undefined) data['subclass'] = SUBCLASS;
      if (SUB_NAME !== undefined) data['subName'] = SUB_NAME;
      if (ITEM !== undefined) data['item'] = ITEM;
      if (BARCODE !== undefined) data['barcode'] = BARCODE;
      if (ITEM_DESC !== undefined) data['itemDesc'] = ITEM_DESC;
      if (TRAN_TYPE !== undefined) data['tranType'] = TRAN_TYPE;
      if (QTY !== undefined) data['qty'] = QTY;
      if (UNIT_RETAIL !== undefined) data['unitRetail'] = UNIT_RETAIL;
      if (RESA_VALUE !== undefined) data['resaValue'] = RESA_VALUE;
      if (LEGACY_DEPARTMENT !== undefined)
        data['legacyDepartment'] = LEGACY_DEPARTMENT;
      if (PE_DIVSION !== undefined) data['peDivision'] = PE_DIVSION;
      if (fileId !== undefined) data['fileId'] = fileId;
      if (LOCATION_CODE !== undefined) data['locationCode'] = LOCATION_CODE;
    } else {
      if (row.Month) {
        const date = new Date(`${row.Month}, ${year}, 1`);
        const dateFormat = date.toISOString().replace('T', ' ').slice(0, 19);
        data.date = dateFormat;
      }
      data.sector = 'DISTRIBUTION_PERFUMERY'
      if (row.Month && row.Month.trim() != '-') { data.month = row.Month; }
      if (row['Expense Type'] && row['Expense Type'].trim() != '-') { data.expenseType = row['Expense Type'].trim(); }
      if (row.Division && row.Division.trim() != '-') { data.division = row.Division.trim(); }
      if (row.Brand && row.Brand.trim() != '-') { data.brand = row.Brand.trim(); }
      if (row['Staff Code'] && row['Staff Code'].trim() != '-') { data.staffCode = row['Staff Code'].trim(); }
      if (row.Name && row.Name.trim() != '-') { data.name = row.Name; }
      if (row.Location && row.Location.trim() != '-') { data.location = row.Location; }
      if (row['Shop Budget'] && row['Shop Budget'].trim() != '-') { data.shopBudget = row['Shop Budget']; }
      if (row['Shop Sales'] && row['Shop Sales'].trim() != '-') { data.shopSales = row['Shop Sales'].trim(); }
      if (row['Shop Achievement'] && row['Shop Achievement'].trim() != '-') { data.shopAchievement = row['Shop Achievement'].trim(); }
      if (row.Fragrance && row.Fragrance.trim() != '-') { data.fragrance = row.Fragrance.trim(); }
      if (row['Make Up'] && row['Make Up'].trim() != '-') { data.makeUp = row['Make Up'].trim(); }
      if (row['Skin Care'] && row['Skin Care'].trim() != '-') { data.skinCare = row['Skin Care'].trim(); }
      if (row['Total Values Of Items Sold'] && row['Total Values Of Items Sold'] != '-') {
        data.totalValuesOfItemsSold = row['Total Values Of Items Sold'].trim();
      }
      if (row.Rate && row.Rate != ' -   ') { data.rate = row.Rate; }
      if (row['Qty Of Item Sold'] && row['Qty Of Item Sold'] != ' -   ') {
        data.qtyOfItemSold = row['Qty Of Item Sold'].trim();
      }
      if (row['Total Pin Money Incentives'] && row['Total Pin Money Incentives'] != '0') {
        data.totalPinMoneyIncentives = row['Total Pin Money Incentives'].trim();
      }
      if (row.Rank && row.Rank.trim() != '-') { data.rank = row.Rank.trim(); }
      if (row.Incentives && row.Incentives.trim() != '-') { data.incentives = row.Incentives.trim(); }
      if (row.Description && row.Description.trim() != '') { data.description = row.Description.trim(); }
    }

    return data;
  },

  extractDataEmployeeRow(row) {
    let data = {};
    if (row['Employee Number'] != undefined)
      data['empNo'] = row['Employee Number'];
    if (row['Full Name'] != undefined) data['empName'] = row['Full Name'];
    if (row['Location Group'] != undefined)
      data['locationGroup'] = row['Location Group'];
    if (row['Location Name'] != undefined)
      data['locationName'] = row['Location Name'];
    if (row['Hire Date'] !== undefined) {
      let hireDate = row['Hire Date'];
      if (!isNaN(hireDate)) {
        hireDate = moment('1899-12-30')
          .add(hireDate, 'days')
          .format('DD-MM-YYYY');
      } else if (moment(hireDate, 'DD-MM-YYYY', true).isValid()) {
        hireDate = moment.utc(hireDate, 'DD-MM-YYYY').format('DD-MM-YYYY');
      }
      data['hireDate'] = moment.utc(hireDate, 'DD-MM-YYYY');
    }
    if (row['Job Title'] != undefined) data['position'] = row['Job Title'];
    if (row['Paid Days'] != undefined) data['attendance'] = row['Paid Days'];
    return data;
  },

  extractDataRPMetadata(row) {
    let data = {};
    if (
      row['Products'] != undefined &&
      row['Incentive amount (Unit)'] != undefined &&
      row['Units sold'] != undefined
    ) {
      data['Products'] = row['Products'];
      data['itemIncentive'] = row['Incentive amount (Unit)'];
      data['unitsSold'] = row['Units sold'];
      return data;
    }
  },

  extractWorkshopDataDP(row) {
    let data = {};
    // console.log("row: ", row)
    if (
      row['Products'] != undefined &&
      row['Incentive amount'] != undefined &&
      row['units repaired'] != undefined
    ) {
      data['Products'] = row['Products'];
      data['itemIncentive'] = row['Incentive amount'];
      data['unitsSold'] = row['units repaired'];
      return data;
    }
  },
  getIncentiveRowDP(data = []) {
    for (const [index, row] of data.entries()) {
      // if (row['SALESMAN'] === 'Incentive') {
        return {
          incentiveRow: data[index],
          data: data.slice(0, index).concat(data.slice(index + 1)),
        };
      // }
    }
    return null;
  },
};

module.exports = ExcelHandler;
