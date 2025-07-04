import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const err :
      any =
        exception instanceof HttpException
          ? exception.getResponse()
          : { message: 'Internal Server Error' };
     console.log(exception);
     
     
    
      // console.log("GlobalExceptionFilter");

      
      
      response.status(status).json({
        statusCode: status,
        error : err?.error,
        timestamp: new Date().toTimeString(),
        path: request.url,
        message: err?.message,
      });
    }
  }
  