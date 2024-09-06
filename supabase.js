// Initialize Supabase client

const SBkey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYW9tYWp1aW1qZ3VjcWFueHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NDgxNzYsImV4cCI6MjA0MTAyNDE3Nn0.FBCY-ao6dRw4f5jRC9fd4FtClBYPYiMkXVP4M3mjkpo'
const _supabase = supabase.createClient(
    'https://zoaomajuimjgucqanxrv.supabase.co',
    SBkey
    
  );
  
  console.log('Supabase Instance: ', _supabase);
  
  async function fetchDummyData() {
    try {
      const { data, error } = await _supabase
        .from('scores')
        .select('*');
  
      if (error) throw error;
  
      console.log('Data fetched successfully:', data);
      displayData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  
  function displayData(data) {
    const leaderboardElement = document.querySelector('.leaderboard-scores');
  

    data.forEach((entry, index) => {
      leaderboardElement.innerHTML += `<p>${index + 1}. ${entry.username}: ${entry.points}</p>`;
    });
  }
  
  // Add event listener to leaderboard link
  document.querySelector('.leaderboard').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior (if it’s an anchor tag)
    fetchDummyData();
  });