
import React from 'react';
import { Box, Text, Avatar, Badge, VStack } from '@chakra-ui/react';
import './testMySchools.css';


const testMySchools = () => {
    return (
      <Box className="css-e9uokm">
        <VStack className="css-i625um" direction="column">
          <Text className="chakra-text css-cm23pp">Your Transfers</Text>
          <Box className="css-v9fxl0">
            <Avatar className="css-6h6r0h" src="/chakra-pro/static/media/avatar1.eeef2af6dfcd3ff23cb8.png" />
            <Box className="css-mze077">
              <Text className="chakra-text css-1lbzx44">From Alex Manda</Text>
              <Text className="chakra-text css-3ucocv">Today, 16:36</Text>
            </Box>
            <Badge className="chakra-badge css-d4vqfd">+$50</Badge>
          </Box>
          <Box className="css-v9fxl0">
            <Avatar className="css-6h6r0h" src="/chakra-pro/static/media/avatar2.5692c39db4f8c0ea999e.png" />
            <Box className="css-mze077">
              <Text className="chakra-text css-1lbzx44">To Laura Santos</Text>
              <Text className="chakra-text css-3ucocv">Today, 08:49</Text>
            </Box>
            <Badge className="chakra-badge css-154h4xy">-$27</Badge>
          </Box>
        </VStack>
      </Box>
    );
  };
  
  export default testMySchools;
  