import { useCombined } from './CollegeContext'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export function useCheapestOptionsForUser() {
  const { addCollegeByIpedsId } = useCombined(); // Destructure addCollegeByIpedsId

  const getCheapestOptionsForUser = async (userId) => {
    try {
      console.log('🚀 Starting Cheapest Options Fetch...');
      console.log('🔍 Fetching user data for userId:', userId);

      // Fetch user data
      const userDocRef = doc(db, 'userData', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        console.error('❌ User document does not exist.');
        return [];
      }

      const userData = userDocSnap.data();
      const { SAI, meritScore } = userData;

      console.log('✅ User Data Loaded:', { SAI, meritScore });

      if (typeof SAI !== 'number' || typeof meritScore !== 'number') {
        console.error('❌ User SAI or meritScore is invalid:', { SAI, meritScore });
        return [];
      }

      // Fetch all schools data
      console.log('🔍 Fetching all schools data...');
      const allDataRef = doc(db, 'searchData2', 'allData');
      const allDataSnap = await getDoc(allDataRef);
      if (!allDataSnap.exists()) {
        console.error('❌ All schools data document does not exist.');
        return [];
      }

      const allData = allDataSnap.data();
      console.log('✅ All Schools Data Fetched. Total Keys:', Object.keys(allData).length);

      // Parse all schools data
      const schools = Object.entries(allData).map(([ipedsId, data]) => {
        const parsePrice = (str) => {
          if (!str || typeof str !== 'string') return 0;
          const num = parseFloat(str.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        };

        const parsePercent = (str) => {
          if (!str || typeof str !== 'string') return 0;
          const num = parseFloat(str.replace('%', ''));
          return isNaN(num) ? 0 : num / 100;
        };

        const parseNumber = (str) => {
          if (!str || typeof str !== 'string') return 0; // Default to 0 if missing
          const num = parseFloat(str.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num; // Return 0 instead of Infinity
        };

        return {
          ipedsId,
          name: data.Name || 'Unknown',
          outOfStatePrice: parsePrice(data["Total price for out-of-state students 2022-23"]),
          needMet: parsePercent(data["Avg % of Need met for Freshman"]),
          avgMerit: parsePrice(data["Avg merit award for Freshman w/out need"]),
          meritCutoff: parseNumber(data["Merit Aid Cutoff Score"]),
        };
      });

      console.log('✅ Schools Parsed Successfully. Total:', schools.length);
      console.log('🧩 Sample School:', schools[0]);

      // Logic to decide between need-based and merit-based sorting
      const medianPrice = 90000;
      console.log('ℹ️ Median Price Threshold:', medianPrice);
      let recommended = [];

      if (SAI >= medianPrice) {
        console.log('🎯 SAI >= Median Price. Focusing on Merit-Based Aid...');
      
        const qualifiedForMerit = schools.filter((s) => {
          const meetsMerit = meritScore >= s.meritCutoff;
          console.log(`Checking college: ${s.name}, Merit Cutoff: ${s.meritCutoff}, User Merit: ${meritScore}, Meets: ${meetsMerit}`);
          return meetsMerit;
        });
      
        console.log('🏫 Schools Qualified for Merit Aid:', qualifiedForMerit.length);
        console.log('🏫 Schools Before Sorting:', qualifiedForMerit);
        console.log('Total Qualified Schools:', qualifiedForMerit.length);

        if (qualifiedForMerit.length === 0) {
        console.warn('❌ No schools qualified for merit aid. Sorting skipped.');
        return [];
        }
        // Add detailed logging for avgMerit and outOfStatePrice sorting
        qualifiedForMerit.sort((a, b) => {
          const avgMeritA = isNaN(a.avgMerit) ? 0 : a.avgMerit;
          const avgMeritB = isNaN(b.avgMerit) ? 0 : b.avgMerit;
      
          const priceA = isNaN(a.outOfStatePrice) ? Infinity : a.outOfStatePrice;
          const priceB = isNaN(b.outOfStatePrice) ? Infinity : b.outOfStatePrice;
      
          console.log(`Comparing:
            College A: ${a.name}, Avg Merit Aid: ${avgMeritA}, Out-of-State Price: ${priceA}
            College B: ${b.name}, Avg Merit Aid: ${avgMeritB}, Out-of-State Price: ${priceB}`);
      
          // Sort by largest avgMerit first
          if (avgMeritB !== avgMeritA) {
            console.log(`Merit Difference: ${avgMeritB - avgMeritA}`);
            return avgMeritB - avgMeritA; // Descending order for avgMerit
          }
      
          // Tie-breaker: lowest out-of-state price
          console.log(`Price Difference: ${priceA - priceB}`);
          return priceA - priceB; // Ascending order for price
        });
      
        recommended = qualifiedForMerit.slice(0, 5);
      
        console.log('🏆 Top 5 Merit-Based Colleges After Sorting:');
        console.table(recommended);
      }
      else {
        console.log('🎯 SAI < Median Price. Focusing on Need-Based Aid...');
        schools.sort((a, b) => b.needMet - a.needMet);

        console.log('🏫 Top Schools Sorted by Need Met:');
        console.table(schools.slice(0, 5));

        const topNeed = schools.slice(0, 10);
        const meritQualifiedAmongNeed = topNeed.filter((s) => meritScore >= s.meritCutoff);

        console.log('🏫 Merit Qualified in Need-Based:', meritQualifiedAmongNeed.length);

        if (meritQualifiedAmongNeed.length > 0) {
          meritQualifiedAmongNeed.sort((a, b) => b.avgMerit - a.avgMerit);
          console.log('🏆 Final Merit Qualified Among Need:');
          console.table(meritQualifiedAmongNeed.slice(0, 5));
          recommended = meritQualifiedAmongNeed.slice(0, 5);
        } else {
          console.log('❌ No Merit-Qualified Schools Found. Falling Back to Top Need-Based Schools.');
          recommended = topNeed.slice(0, 5);
        }
      }

      for (const college of recommended) {
        if (college?.ipedsId) {
          try {
            await addCollegeByIpedsId(college.ipedsId, true); // Extract and use ipedsId
            console.log(`Added college with IPEDS ID: ${college.ipedsId}`);
          } catch (error) {
            console.error(`Failed to add college with IPEDS ID: ${college.ipedsId}`, error);
          }
        } else {
          console.warn('College does not have an IPEDS ID:', college);
        }
      }              

      console.log('🏆 Final Recommended Schools:');
      console.table(recommended);

      return recommended;
    } catch (error) {
      console.error('🚨 Error computing cheapest options:', error);
      return [];
    }
  };



  const getHighestMeritAid = async (userId) => {
    try {
      console.log('🚀 Starting Highest Merit Aid Fetch...');
  
      // Step 1: Fetch user data
      const userDocRef = doc(db, 'userData', userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        console.error('❌ User document does not exist.');
        return [];
      }
  
      const userData = userDocSnap.data();
      let { meritScore } = userData;
  
      if (typeof meritScore !== 'number' || isNaN(meritScore)) {
        console.warn('⚠️ Merit score is missing or invalid. Defaulting to 1.0.');
        meritScore = 1.0;
      }
      console.log('✅ User Merit Score:', meritScore);
  
      // Step 2: Fetch all schools data from searchData2 -> allData
      const allDataRef = doc(db, 'searchData2', 'allData');
      const allDataSnap = await getDoc(allDataRef);
  
      if (!allDataSnap.exists()) {
        console.error('❌ All schools data document does not exist.');
        return [];
      }
  
      const allData = allDataSnap.data();
      console.log('✅ All Schools Data Fetched. Total Keys:', Object.keys(allData).length);
  
      // Step 3: Parse and filter schools
      const parsePrice = (value) => {
        if (!value) return 0;
        if (typeof value === 'string') {
          const num = parseFloat(value.replace(/[^0-9.]/g, '')); // Remove non-numeric characters
          return isNaN(num) ? 0 : num;
        }
        return typeof value === 'number' ? value : 0;
      };
  
      const schools = Object.entries(allData).map(([ipedsId, data]) => ({
        ipedsId,
        name: data.Name || 'Unknown',
        avgMerit: parsePrice(data["Avg merit award for Freshman w/out need"]),
        meritCutoff: parseFloat(data["Merit Aid Cutoff Score"]) || 0,
      }));
  
      console.log('✅ Parsed Schools:', schools);
  
      // Step 4: Filter schools based on merit score
      const qualifiedForMerit = schools.filter((school) => meritScore >= school.meritCutoff);
  
      if (qualifiedForMerit.length === 0) {
        console.warn('❌ No schools qualify for merit aid.');
        return [];
      }
  
      // Step 5: Sort schools by avgMerit in descending order
      qualifiedForMerit.sort((a, b) => b.avgMerit - a.avgMerit);
  
      console.log('🏆 Top Merit-Based Colleges:');
      console.table(qualifiedForMerit.slice(0, 5));

      for (const college of (qualifiedForMerit.slice(0, 5))) {
        if (college?.ipedsId) {
          try {
            await addCollegeByIpedsId(college.ipedsId, true); // Extract and use ipedsId
            console.log(`Added college with IPEDS ID: ${college.ipedsId}`);
          } catch (error) {
            console.error(`Failed to add college with IPEDS ID: ${college.ipedsId}`, error);
          }
        } else {
          console.warn('College does not have an IPEDS ID:', college);
        }
      }     
  
      return qualifiedForMerit.slice(0, 5); // Return top 5 results
    } catch (error) {
      console.error('🚨 Error fetching highest merit aid options:', error);
      return [];
    }
  };
  
  

  return { getCheapestOptionsForUser, getHighestMeritAid };
}

